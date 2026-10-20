const mongoose = require('mongoose');

const StatusHistoryItemSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['applied', 'under_review', 'shortlisted', 'assessment', 'interview_scheduled', 'selected', 'rejected', 'withdrawn']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: {
      type: String,
      default: ''
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const ApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    profileSnapshot: {
      fullName: { type: String, required: true },
      collegeEmail: { type: String },
      university: { type: String },
      degree: { type: String },
      branch: { type: String },
      graduationYear: { type: Number },
      cgpa: { type: Number },
      backlogs: { type: Number, default: 0 },
      skills: [{ type: String }],
      resumeUrl: { type: String },
      phone: { type: String }
    },
    status: {
      type: String,
      enum: ['applied', 'under_review', 'shortlisted', 'assessment', 'interview_scheduled', 'selected', 'rejected', 'withdrawn'],
      default: 'applied'
    },
    statusHistory: [StatusHistoryItemSchema],
    eligibilitySnapshot: {
      isEligible: { type: Boolean, default: true },
      reasons: [{ type: String }],
      evaluatedAt: { type: Date, default: Date.now }
    },
    customAnswers: {
      type: Map,
      of: String,
      default: {}
    },
    notes: {
      type: String,
      default: ''
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate application by same student to same job
ApplicationSchema.index({ job: 1, student: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ appliedAt: -1 });

module.exports = mongoose.model('Application', ApplicationSchema);
