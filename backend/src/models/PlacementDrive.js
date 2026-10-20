const mongoose = require('mongoose');

const PlacementDriveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Drive title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    academicYear: {
      type: String,
      required: true,
      default: '2025-2026'
    },
    semester: {
      type: String,
      default: 'Final Year Campus Recruitment'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    eligibleBranches: [
      {
        type: String,
        trim: true
      }
    ],
    minCgpa: {
      type: Number,
      default: 6.5
    },
    maxBacklogs: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'archived'],
      default: 'ongoing'
    },
    participatingCompanies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
      }
    ],
    coordinatorName: {
      type: String,
      default: 'Dr. Placement Officer'
    },
    coordinatorEmail: {
      type: String,
      default: 'placement@college.edu'
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    bannerUrl: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PlacementDrive', PlacementDriveSchema);
