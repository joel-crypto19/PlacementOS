const Job = require('../models/Job');
const DataSource = require('../models/DataSource');
const SyncLog = require('../models/SyncLog');
const AdzunaAdapter = require('./adapters/adzunaAdapter');
const USAJobsAdapter = require('./adapters/usaJobsAdapter');

class SyncService {
  constructor() {
    this.adapters = {
      adzuna: new AdzunaAdapter(),
      usajobs: new USAJobsAdapter()
    };
  }

  /**
   * Initializes or updates DataSource entries in DB based on environment
   */
  async initializeDataSources() {
    const defaultSources = [
      {
        name: 'Adzuna Job Search API',
        providerKey: 'adzuna',
        description: 'Global and India-specific verified jobs and technical internships.',
        apiConfig: {
          appId: process.env.ADZUNA_APP_ID || '',
          apiKey: process.env.ADZUNA_API_KEY || '',
          country: 'in',
          searchQuery: 'software engineer intern developer'
        }
      },
      {
        name: 'USAJobs Federal API',
        providerKey: 'usajobs',
        description: 'US Federal Technology and Engineering positions.',
        apiConfig: {
          apiKey: process.env.USAJOBS_API_KEY || '',
          searchQuery: 'software engineer'
        }
      }
    ];

    for (const src of defaultSources) {
      const adapter = this.adapters[src.providerKey];
      const isConfigured = adapter ? adapter.isConfigured() : false;

      await DataSource.findOneAndUpdate(
        { providerKey: src.providerKey },
        {
          $set: {
            name: src.name,
            description: src.description,
            isConfigured,
            apiConfig: src.apiConfig,
            lastSyncStatus: isConfigured ? 'idle' : 'not_configured',
            lastSyncMessage: isConfigured
              ? 'Ready for synchronization.'
              : `Missing API credentials (${src.providerKey === 'adzuna' ? 'ADZUNA_APP_ID & ADZUNA_API_KEY' : 'USAJOBS_API_KEY & USAJOBS_EMAIL'}).`
          }
        },
        { upsert: true, new: true }
      );
    }
  }

  /**
   * Synchronize opportunities from a specific provider
   */
  async syncProvider(providerKey, triggeredBy = 'manual_admin') {
    const startTime = Date.now();
    const adapter = this.adapters[providerKey];

    if (!adapter) {
      throw new Error(`Unknown data provider: '${providerKey}'`);
    }

    let dataSource = await DataSource.findOne({ providerKey });
    if (!dataSource) {
      await this.initializeDataSources();
      dataSource = await DataSource.findOne({ providerKey });
    }

    if (!adapter.isConfigured()) {
      const message = `Provider '${adapter.name}' is not configured. Please supply required API credentials in .env or dashboard settings.`;
      
      const log = await SyncLog.create({
        dataSource: dataSource?._id,
        providerKey,
        status: 'not_configured',
        itemsFetched: 0,
        itemsImported: 0,
        itemsUpdated: 0,
        itemsSkipped: 0,
        errorMessage: message,
        triggeredBy,
        executionDurationMs: Date.now() - startTime
      });

      if (dataSource) {
        dataSource.lastSyncStatus = 'not_configured';
        dataSource.lastSyncMessage = message;
        dataSource.lastSyncAt = new Date();
        await dataSource.save();
      }

      return {
        success: false,
        status: 'not_configured',
        message,
        log
      };
    }

    let itemsFetched = 0;
    let itemsImported = 0;
    let itemsUpdated = 0;
    let itemsSkipped = 0;
    let errorMessage = '';

    try {
      const rawListings = await adapter.fetchOpportunities({
        country: dataSource?.apiConfig?.country || 'in',
        query: dataSource?.apiConfig?.searchQuery || 'software engineer intern'
      });

      itemsFetched = rawListings.length;

      for (const listing of rawListings) {
        if (!listing.externalId) {
          itemsSkipped++;
          continue;
        }

        const existingJob = await Job.findOne({
          sourceProvider: providerKey,
          externalId: listing.externalId
        });

        if (existingJob) {
          // Update existing job without overwriting recruiter manual edits
          existingJob.lastVerifiedAt = new Date();
          existingJob.applicationDeadline = listing.applicationDeadline;
          existingJob.salaryOrStipend = listing.salaryOrStipend;
          existingJob.externalUrl = listing.externalUrl;
          await existingJob.save();
          itemsUpdated++;
        } else {
          // Create new synchronized job listing
          await Job.create(listing);
          itemsImported++;
        }
      }

      const duration = Date.now() - startTime;
      const status = itemsFetched > 0 ? 'success' : 'partial';
      const successMessage = `Synchronized ${itemsFetched} opportunities (${itemsImported} new, ${itemsUpdated} updated, ${itemsSkipped} skipped) in ${duration}ms.`;

      const log = await SyncLog.create({
        dataSource: dataSource?._id,
        providerKey,
        status,
        itemsFetched,
        itemsImported,
        itemsUpdated,
        itemsSkipped,
        triggeredBy,
        executionDurationMs: duration
      });

      if (dataSource) {
        dataSource.lastSyncStatus = status;
        dataSource.lastSyncMessage = successMessage;
        dataSource.lastSyncAt = new Date();
        dataSource.totalImportedCount = (dataSource.totalImportedCount || 0) + itemsImported;
        await dataSource.save();
      }

      return {
        success: true,
        status,
        message: successMessage,
        stats: { itemsFetched, itemsImported, itemsUpdated, itemsSkipped, duration },
        log
      };
    } catch (err) {
      const duration = Date.now() - startTime;
      errorMessage = err.message || 'Error occurred during data synchronization.';

      const log = await SyncLog.create({
        dataSource: dataSource?._id,
        providerKey,
        status: 'failed',
        itemsFetched,
        itemsImported,
        itemsUpdated,
        itemsSkipped,
        errorMessage,
        triggeredBy,
        executionDurationMs: duration
      });

      if (dataSource) {
        dataSource.lastSyncStatus = 'failed';
        dataSource.lastSyncMessage = errorMessage;
        dataSource.lastSyncAt = new Date();
        dataSource.errorCount = (dataSource.errorCount || 0) + 1;
        await dataSource.save();
      }

      return {
        success: false,
        status: 'failed',
        message: errorMessage,
        log
      };
    }
  }

  /**
   * Run sync across all enabled providers
   */
  async syncAll(triggeredBy = 'manual_admin') {
    const results = {};
    for (const key of Object.keys(this.adapters)) {
      results[key] = await this.syncProvider(key, triggeredBy);
    }
    return results;
  }
}

module.exports = new SyncService();
