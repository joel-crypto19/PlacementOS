const cron = require('node-cron');
const syncService = require('../integrations/syncService');
const env = require('../config/env');

let scheduledTask = null;
let isSyncRunning = false;

/**
 * Execute synchronization with execution locking
 * @param {string} triggeredBy 'schedule' | 'manual_admin'
 */
const executeSync = async (triggeredBy = 'schedule') => {
  if (isSyncRunning) {
    console.warn(`[SyncScheduler] Sync already in progress. Skipping trigger (${triggeredBy}).`);
    return { skipped: true, reason: 'Already in progress' };
  }

  isSyncRunning = true;
  const startedAt = new Date();
  console.log(`[SyncScheduler] [${startedAt.toISOString()}] Starting scheduled data synchronization...`);

  try {
    const results = await syncService.syncAll(triggeredBy);
    const duration = Date.now() - startedAt.getTime();
    console.log(`[SyncScheduler] Scheduled sync completed in ${duration}ms.`);
    return { success: true, results, duration };
  } catch (err) {
    console.error(`[SyncScheduler] Scheduled sync fatal error:`, err.message);
    return { success: false, error: err.message };
  } finally {
    isSyncRunning = false;
  }
};

/**
 * Starts the reliable cron scheduler
 */
const startSyncScheduler = () => {
  if (!env.ENABLE_BACKGROUND_CRON) {
    console.log('[SyncScheduler] Background cron disabled via ENABLE_BACKGROUND_CRON=false. Use CLI/external runner.');
    return;
  }

  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }

  const cronPattern = env.SYNC_CRON_SCHEDULE;

  if (!cron.validate(cronPattern)) {
    console.error(`[SyncScheduler] Invalid CRON expression: "${cronPattern}". Falling back to '0 */12 * * *'`);
  }

  const validPattern = cron.validate(cronPattern) ? cronPattern : '0 */12 * * *';

  scheduledTask = cron.schedule(validPattern, async () => {
    await executeSync('schedule');
  });

  console.log(`[SyncScheduler] Cron scheduler active. Schedule pattern: "${validPattern}".`);
};

/**
 * Stops the active scheduler
 */
const stopSyncScheduler = () => {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('[SyncScheduler] Cron scheduler stopped.');
  }
};

module.exports = {
  startSyncScheduler,
  stopSyncScheduler,
  executeSync
};
