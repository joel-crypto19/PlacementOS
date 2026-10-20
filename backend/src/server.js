const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const syncService = require('./integrations/syncService');
const { startSyncScheduler } = require('./services/syncScheduler');

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Initialize Data Sources metadata
    await syncService.initializeDataSources();

    // 3. Start background sync timer
    startSyncScheduler();

    // 4. Start HTTP Server
    const server = app.listen(env.PORT, () => {
      console.log(`====================================================`);
      console.log(`  PlacementOS Backend running on port ${env.PORT}`);
      console.log(`  Environment: ${env.NODE_ENV}`);
      console.log(`  Health Check: http://localhost:${env.PORT}/api/health`);
      console.log(`====================================================`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('[PlacementOS] Gracefully shutting down...');
      server.close(() => {
        console.log('[PlacementOS] Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[PlacementOS Server] Fatal startup error:', error.message);
    process.exit(1);
  }
};

startServer();
