const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const { checkEligibility } = require('../services/eligibilityService');
const { createNotification } = require('../services/notificationService');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Apply for an opportunity
 * POST /api/applications
 */
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, customAnswers, notes } = req.body;
    const studentId = req.user._id;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opportunity not found.' });
    }

    // Check if deadline passed
    if (new Date() > new Date(job.applicationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has already passed for this position.'
      });
    }

    // Check duplicate application
    const existingApplication = await Application.findOne({ job: jobId, student: studentId });
    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this position.',
        applicationId: existingApplication._id
      });
    }

    // Get student profile
    const profile = await StudentProfile.findOne({ user: studentId });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Student profile not found. Please complete your academic profile before applying.'
      });
    }

    // Check eligibility
    const eligibilityResult = checkEligibility(profile, job);

    // Take immutable snapshots
    const profileSnapshot = {
      fullName: profile.fullName || req.user.name,
      collegeEmail: profile.collegeEmail || req.user.email,
      university: profile.university,
      degree: profile.degree,
      branch: profile.branch,
      graduationYear: profile.graduationYear,
      cgpa: profile.cgpa,
      backlogs: profile.backlogs,
      skills: profile.skills || [],
      resumeUrl: profile.resumeUrl || '',
      phone: profile.phone || req.user.phone || ''
    };

    const eligibilitySnapshot = {
      isEligible: eligibilityResult.isEligible,
      reasons: eligibilityResult.reasons,
      evaluatedAt: new Date()
    };

    const application = await Application.create({
      job: jobId,
      student: studentId,
      profileSnapshot,
      eligibilitySnapshot,
      status: 'applied',
      statusHistory: [
        {
          status: 'applied',
          changedBy: studentId,
          note: 'Application submitted by student.',
          changedAt: new Date()
        }
      ],
      customAnswers: customAnswers || {},
      notes: notes || '',
      appliedAt: new Date()
    });

    // Increment job applications counter
    job.applicationsCount = (job.applicationsCount || 0) + 1;
    await job.save();

    // Create notification for student
    await createNotification({
      recipient: studentId,
      title: 'Application Submitted',
      message: `Your application for ${job.title} at ${job.companyName} was submitted successfully.`,
      type: 'application',
      link: `/applications`
    });

    // Notify recruiter if created by one
    if (job.createdBy) {
      await createNotification({
        recipient: job.createdBy,
        title: 'New Candidate Applied',
        message: `${profile.fullName} applied for ${job.title}.`,
        type: 'application',
        link: `/recruiter/jobs/${job._id}/applicants`
      });
    }

    await logAudit({
      user: req.user,
      action: 'SUBMIT_APPLICATION',
      resourceType: 'Application',
      resourceId: application._id,
      details: { jobId: job._id, jobTitle: job.title }
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current student's applications
 * GET /api/applications/me
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('job', 'title companyName companyLogo location jobType salaryOrStipend applicationDeadline status externalUrl applicationMethod')
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get applications for a specific job (Recruiter or Admin)
 * GET /api/applications/job/:jobId
 */
const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, search } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Permission check
    const isOwner = job.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view applicants for this job.' });
    }

    const query = { job: jobId };
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('student', 'name email avatar phone')
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      job,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update application recruitment stage / status
 * PATCH /api/applications/:id/status
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = [
      'applied', 'under_review', 'shortlisted', 'assessment',
      'interview_scheduled', 'selected', 'rejected', 'withdrawn'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Valid options: [${validStatuses.join(', ')}]`
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'title companyName createdBy')
      .populate('student', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Authorization check
    const isOwner = application.job?.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this application.' });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Application moved to ${status}.`,
      changedAt: new Date()
    });

    await application.save();

    // Create in-app notification for candidate
    await createNotification({
      recipient: application.student._id,
      title: `Application Status Updated: ${status.replace('_', ' ').toUpperCase()}`,
      message: `Your application status for ${application.job.title} at ${application.job.companyName} has been updated to "${status.replace('_', ' ')}". ${note ? `Note: ${note}` : ''}`,
      type: 'application',
      link: `/applications`
    });

    await logAudit({
      user: req.user,
      action: 'UPDATE_APPLICATION_STATUS',
      resourceType: 'Application',
      resourceId: application._id,
      details: { newStatus: status, note }
    });

    return res.status(200).json({
      success: true,
      message: `Application marked as ${status}.`,
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw application by student
 * POST /api/applications/:id/withdraw
 */
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('job', 'title companyName');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (['selected', 'rejected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an application that is already ${application.status}.`
      });
    }

    application.status = 'withdrawn';
    application.statusHistory.push({
      status: 'withdrawn',
      changedBy: req.user._id,
      note: 'Withdrawn by student candidate.',
      changedAt: new Date()
    });

    await application.save();

    await logAudit({
      user: req.user,
      action: 'WITHDRAW_APPLICATION',
      resourceType: 'Application',
      resourceId: application._id
    });

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully.',
      application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication
};
