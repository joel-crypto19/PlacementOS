const DataSource = require('../models/DataSource');
const SyncLog = require('../models/SyncLog');
const syncService = require('../integrations/syncService');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Get all data sources and current synchronization health
 * GET /api/sync/sources
 */
const getDataSources = async (req, res, next) => {
  try {
    await syncService.initializeDataSources();
    const sources = await DataSource.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      sources
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually trigger data synchronization for a provider
 * POST /api/sync/trigger/:providerKey
 */
const triggerSync = async (req, res, next) => {
  try {
    const { providerKey } = req.params;
    const result = await syncService.syncProvider(providerKey, 'manual_admin');

    await logAudit({
      user: req.user,
      action: 'TRIGGER_DATA_SYNC',
      resourceType: 'DataSource',
      details: { providerKey, status: result.status, message: result.message }
    });

    return res.status(result.success ? 200 : 400).json({
      success: result.success,
      status: result.status,
      message: result.message,
      stats: result.stats,
      log: result.log
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get historical synchronization logs
 * GET /api/sync/logs
 */
const getSyncLogs = async (req, res, next) => {
  try {
    const { providerKey, limit = 20 } = req.query;
    const query = {};
    if (providerKey) query.providerKey = providerKey;

    const logs = await SyncLog.find(query)
      .populate('dataSource', 'name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDataSources,
  triggerSync,
  getSyncLogs
};
