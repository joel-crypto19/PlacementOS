const mongoose = require('mongoose');

const DataSourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    providerKey: {
      type: String,
      required: true,
      unique: true,
      enum: ['adzuna', 'usajobs', 'seed_demo']
    },
    isEnabled: {
      type: Boolean,
      default: true
    },
    isConfigured: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      default: ''
    },
    apiConfig: {
      appId: { type: String, default: '' },
      apiKey: { type: String, default: '' },
      country: { type: String, default: 'in' }, // 'in' for India, 'us' for USA
      searchQuery: { type: String, default: 'software engineer intern developer' },
      maxResultsPerSync: { type: Number, default: 20 }
    },
    syncIntervalHours: {
      type: Number,
      default: 24
    },
    lastSyncAt: {
      type: Date,
      default: null
    },
    lastSyncStatus: {
      type: String,
      enum: ['idle', 'success', 'failed', 'partial', 'not_configured'],
      default: 'idle'
    },
    lastSyncMessage: {
      type: String,
      default: 'No sync has been executed yet.'
    },
    totalImportedCount: {
      type: Number,
      default: 0
    },
    errorCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DataSource', DataSourceSchema);
