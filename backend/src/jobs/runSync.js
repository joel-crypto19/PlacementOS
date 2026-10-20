/**
 * Standalone Synchronizer Job Runner
 * Designed for deployment on platform cron runners:
 * - Render Cron Jobs
 * - Heroku Scheduler
 * - AWS EventBridge / ECS Scheduled Tasks
 * - Kubernetes CronJobs
 * - Linux crontab / Windows Task Scheduler
 *
 * Usage:
 *   node src/jobs/runSync.js
 *   or: npm run sync
 */
const mongoose = require('mongoose');
const env = require('../config/env');
const connectDB = require('../config/db');
const syncService = require('../integrations/syncService');

const run = async () => {
  const startTime = Date.now();
  console.log(`[Job:runSync] Starting scheduled synchronization runner at ${new Date().toISOString()}`);

  let exitCode = 0;
  try {
    // Connect to database
    await connectDB();
    await syncService.initializeDataSources();

    // Run synchronization for all enabled providers
    const results = await syncService.syncAll('schedule');

    console.log('[Job:runSync] Synchronization results:');
    for (const [provider, res] of Object.entries(results)) {
      console.log(`  - ${provider.toUpperCase()}: status=${res.status}, success=${res.success}`);
      if (res.message) {
        console.log(`    Message: ${res.message}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Job:runSync] Synchronization run completed in ${duration}ms.`);
  } catch (err) {
    console.error(`[Job:runSync] Fatal job failure:`, err.message);
    exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('[Job:runSync] Database connection closed.');
    }
    process.exit(exitCode);
  }
};

run();
