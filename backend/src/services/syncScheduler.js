const syncService = require('../integrations/syncService');
const env = require('../config/env');

let syncIntervalHandle = null;

const startSyncScheduler = () => {
  if (syncIntervalHandle) {
    clearInterval(syncIntervalHandle);
  }

  const intervalMs = (env.SYNC_INTERVAL_HOURS || 24) * 60 * 60 * 1000;
  console.log(`[SyncScheduler] Background sync scheduler active (Interval: ${env.SYNC_INTERVAL_HOURS} hours).`);

  syncIntervalHandle = setInterval(async () => {
    console.log('[SyncScheduler] Triggering scheduled data synchronization...');
    try {
      await syncService.syncAll('schedule');
    } catch (err) {
      console.error('[SyncScheduler] Scheduled sync error:', err.message);
    }
  }, intervalMs);
};

const stopSyncScheduler = () => {
  if (syncIntervalHandle) {
    clearInterval(syncIntervalHandle);
    syncIntervalHandle = null;
  }
};

module.exports = { startSyncScheduler, stopSyncScheduler };
