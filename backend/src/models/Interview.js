const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true
    },
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
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    roundName: {
      type: String,
      required: true,
      default: 'Technical Interview'
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    durationMinutes: {
      type: Number,
      default: 45
    },
    mode: {
      type: String,
      enum: ['online', 'in-person', 'phone'],
      default: 'online'
    },
    meetingLinkOrLocation: {
      type: String,
      default: 'https://meet.google.com/placementos-interview'
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    feedback: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

InterviewSchema.index({ student: 1, scheduledAt: 1 });
InterviewSchema.index({ recruiter: 1, scheduledAt: 1 });

module.exports = mongoose.model('Interview', InterviewSchema);
