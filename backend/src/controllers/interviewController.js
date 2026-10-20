const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { createNotification } = require('../services/notificationService');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Schedule an interview for an application
 * POST /api/interviews
 */
const scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, roundName, scheduledAt, durationMinutes, mode, meetingLinkOrLocation, notes } = req.body;

    if (!applicationId || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'Application ID and scheduled date/time are required.' });
    }

    const application = await Application.findById(applicationId)
      .populate('job')
      .populate('student');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Permission check
    const isOwner = application.job.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to schedule interviews for this opportunity.' });
    }

    const interview = await Interview.create({
      application: applicationId,
      job: application.job._id,
      student: application.student._id,
      recruiter: req.user._id,
      roundName: roundName || 'Technical Interview',
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes || 45,
      mode: mode || 'online',
      meetingLinkOrLocation: meetingLinkOrLocation || 'https://meet.google.com/placementos-interview',
      notes: notes || '',
      status: 'scheduled'
    });

    // Automatically transition application status to 'interview_scheduled'
    application.status = 'interview_scheduled';
    application.statusHistory.push({
      status: 'interview_scheduled',
      changedBy: req.user._id,
      note: `Interview scheduled: ${roundName || 'Round'} on ${new Date(scheduledAt).toLocaleString()}`,
      changedAt: new Date()
    });
    await application.save();

    // Notify student
    await createNotification({
      recipient: application.student._id,
      title: 'Interview Scheduled!',
      message: `You have an interview scheduled for ${application.job.title} at ${application.job.companyName} on ${new Date(scheduledAt).toLocaleDateString()} at ${new Date(scheduledAt).toLocaleTimeString()}. Mode: ${mode}.`,
      type: 'interview',
      link: `/applications`
    });

    await logAudit({
      user: req.user,
      action: 'SCHEDULE_INTERVIEW',
      resourceType: 'Interview',
      resourceId: interview._id,
      details: { student: application.student.email, job: application.job.title, roundName }
    });

    return res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully and invitation sent to student.',
      interview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get interviews for current user (student or recruiter)
 * GET /api/interviews/my
 */
const getMyInterviews = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'recruiter') {
      query.recruiter = req.user._id;
    }

    const interviews = await Interview.find(query)
      .populate('job', 'title companyName location')
      .populate('student', 'name email avatar phone')
      .populate('recruiter', 'name email')
      .sort({ scheduledAt: 1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update interview status, feedback, or rating
 * PATCH /api/interviews/:id
 */
const updateInterview = async (req, res, next) => {
  try {
    const { status, feedback, rating, notes, scheduledAt, meetingLinkOrLocation } = req.body;
    const interview = await Interview.findById(req.params.id)
      .populate('job', 'title companyName')
      .populate('student', 'name email');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    const isRecruiter = interview.recruiter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isRecruiter && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this interview.' });
    }

    if (status) interview.status = status;
    if (feedback !== undefined) interview.feedback = feedback;
    if (rating !== undefined) interview.rating = rating;
    if (notes !== undefined) interview.notes = notes;
    if (scheduledAt) interview.scheduledAt = new Date(scheduledAt);
    if (meetingLinkOrLocation !== undefined) interview.meetingLinkOrLocation = meetingLinkOrLocation;

    await interview.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_INTERVIEW',
      resourceType: 'Interview',
      resourceId: interview._id,
      details: { status, rating }
    });

    return res.status(200).json({
      success: true,
      message: 'Interview record updated.',
      interview
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scheduleInterview,
  getMyInterviews,
  updateInterview
};
