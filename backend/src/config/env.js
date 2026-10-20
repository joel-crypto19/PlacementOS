const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placementos',
  JWT_SECRET: process.env.JWT_SECRET || 'placementos-super-secret-jwt-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  ADZUNA_APP_ID: process.env.ADZUNA_APP_ID || '',
  ADZUNA_API_KEY: process.env.ADZUNA_API_KEY || '',
  USAJOBS_API_KEY: process.env.USAJOBS_API_KEY || '',
  USAJOBS_EMAIL: process.env.USAJOBS_EMAIL || '',
  SYNC_INTERVAL_HOURS: parseInt(process.env.SYNC_INTERVAL_HOURS || '24', 10),
  SYNC_CRON_SCHEDULE: process.env.SYNC_CRON_SCHEDULE || '0 */12 * * *',
  ENABLE_BACKGROUND_CRON: process.env.ENABLE_BACKGROUND_CRON !== 'false',
  UPLOAD_PATH: process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads/resumes'),
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};
