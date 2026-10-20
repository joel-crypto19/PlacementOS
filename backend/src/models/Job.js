const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    companyLogo: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    responsibilities: [
      {
        type: String,
        trim: true
      }
    ],
    requirements: [
      {
        type: String,
        trim: true
      }
    ],
    skillsRequired: [
      {
        type: String,
        trim: true
      }
    ],
    jobType: {
      type: String,
      enum: ['full-time', 'internship', 'contract', 'part-time'],
      default: 'full-time'
    },
    workMode: {
      type: String,
      enum: ['onsite', 'hybrid', 'remote'],
      default: 'onsite'
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    salaryOrStipend: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      period: {
        type: String,
        enum: ['yearly', 'monthly', 'hourly'],
        default: 'yearly'
      },
      isDisclosed: { type: Boolean, default: true }
    },
    eligibility: {
      minCgpa: { type: Number, default: 0 },
      allowedBranches: [{ type: String, trim: true }],
      allowedGraduationYears: [{ type: Number }],
      maxBacklogs: { type: Number, default: 0 }
    },
    applicationOpeningDate: {
      type: Date,
      default: Date.now
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required']
    },
    applicationMethod: {
      type: String,
      enum: ['internal', 'external'],
      default: 'internal'
    },
    externalUrl: {
      type: String,
      trim: true,
      default: ''
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      default: null
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'draft', 'archived'],
      default: 'open'
    },
    sourceProvider: {
      type: String,
      enum: ['direct', 'adzuna', 'usajobs', 'seed_demo'],
      default: 'direct'
    },
    externalId: {
      type: String,
      default: null
    },
    isDemo: {
      type: Boolean,
      default: false
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    applicationsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching and filtering
JobSchema.index({ title: 'text', description: 'text', skillsRequired: 'text', companyName: 'text' });
JobSchema.index({ status: 1, applicationDeadline: 1 });
JobSchema.index({ jobType: 1, workMode: 1, location: 1 });
JobSchema.index({ sourceProvider: 1, externalId: 1 }, { unique: false, sparse: true });

// Virtual to check if listing is currently active
JobSchema.virtual('isExpired').get(function () {
  return new Date() > new Date(this.applicationDeadline);
});

module.exports = mongoose.model('Job', JobSchema);
