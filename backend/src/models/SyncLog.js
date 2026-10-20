const mongoose = require('mongoose');

const SyncLogSchema = new mongoose.Schema(
  {
    dataSource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DataSource',
      default: null
    },
    providerKey: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'partial', 'failed', 'not_configured'],
      required: true
    },
    itemsFetched: {
      type: Number,
      default: 0
    },
    itemsImported: {
      type: Number,
      default: 0
    },
    itemsUpdated: {
      type: Number,
      default: 0
    },
    itemsSkipped: {
      type: Number,
      default: 0
    },
    errorMessage: {
      type: String,
      default: ''
    },
    triggeredBy: {
      type: String,
      enum: ['schedule', 'manual_admin'],
      default: 'manual_admin'
    },
    executionDurationMs: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

SyncLogSchema.index({ providerKey: 1, timestamp: -1 });

module.exports = mongoose.model('SyncLog', SyncLogSchema);
