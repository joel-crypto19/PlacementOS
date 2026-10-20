const path = require('path');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Interview = require('../models/Interview');
const Job = require('../models/Job');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Get current student's full profile
 * GET /api/students/profile
 */
const getMyProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({
        user: req.user._id,
        fullName: req.user.name,
        collegeEmail: req.user.email
      });
    }

    return res.status(200).json({
      success: true,
      profile,
      completeness: profile.calculateCompleteness()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current student's profile
 * PUT /api/students/profile
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'fullName', 'collegeEmail', 'university', 'degree', 'branch',
      'graduationYear', 'cgpa', 'backlogs', 'skills', 'projects',
      'certifications', 'workExperience', 'githubUrl', 'linkedinUrl',
      'portfolioUrl', 'phone', 'bio'
    ];

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user._id });
    }

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await profile.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_STUDENT_PROFILE',
      resourceType: 'StudentProfile',
      resourceId: profile._id
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile,
      completeness: profile.calculateCompleteness()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload student resume
 * POST /api/students/resume
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file (PDF, DOC, DOCX).' });
    }

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user._id, fullName: req.user.name });
    }

    // Relative URL accessible via static /uploads route
    const relativeUrl = `/uploads/resumes/${req.file.filename}`;
    profile.resumeUrl = relativeUrl;
    profile.resumeOriginalName = req.file.originalname;
    profile.resumeUploadedAt = new Date();

    await profile.save();

    await logAudit({
      user: req.user,
      action: 'UPLOAD_RESUME',
      resourceType: 'StudentProfile',
      resourceId: profile._id,
      details: { filename: req.file.originalname, size: req.file.size }
    });

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      resumeUrl: relativeUrl,
      resumeOriginalName: req.file.originalname
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive student dashboard analytics
 * GET /api/students/dashboard
 */
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Fetch profile
    const profile = await StudentProfile.findOne({ user: studentId });

    // Fetch applications
    const applications = await Application.find({ student: studentId })
      .populate('job', 'title companyName location jobType salaryOrStipend applicationDeadline')
      .sort({ appliedAt: -1 });

    const totalApplications = applications.length;
    const underReviewCount = applications.filter(a => a.status === 'under_review').length;
    const shortlistedCount = applications.filter(a => a.status === 'shortlisted' || a.status === 'assessment').length;
    const interviewCount = applications.filter(a => a.status === 'interview_scheduled').length;
    const selectedCount = applications.filter(a => a.status === 'selected').length;
    const rejectedCount = applications.filter(a => a.status === 'rejected').length;

    // Upcoming interviews
    const upcomingInterviews = await Interview.find({
      student: studentId,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() }
    })
      .populate('job', 'title companyName')
      .populate('recruiter', 'name email')
      .sort({ scheduledAt: 1 });

    // Saved jobs
    const savedJobs = await SavedJob.find({ student: studentId })
      .populate('job')
      .sort({ savedAt: -1 });

    // Upcoming deadlines from saved jobs or open relevant jobs
    const upcomingDeadlines = await Job.find({
      status: 'open',
      applicationDeadline: { $gte: new Date(), $lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }
    })
      .select('title companyName applicationDeadline jobType location salaryOrStipend')
      .sort({ applicationDeadline: 1 })
      .limit(6);

    // Profile completeness
    const completeness = profile ? profile.calculateCompleteness() : 0;

    return res.status(200).json({
      success: true,
      dashboard: {
        profileCompleteness: completeness,
        metrics: {
          totalApplications,
          underReviewCount,
          shortlistedCount,
          interviewCount,
          selectedCount,
          rejectedCount,
          savedCount: savedJobs.length
        },
        recentApplications: applications.slice(0, 5),
        upcomingInterviews,
        savedJobsCount: savedJobs.length,
        upcomingDeadlines,
        skillsCount: profile?.skills?.length || 0,
        projectsCount: profile?.projects?.length || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student by ID (Authorized recruiters or admins)
 * GET /api/students/:id
 */
const getStudentById = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findById(req.params.id).populate('user', 'name email avatar phone');
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    return res.status(200).json({
      success: true,
      profile: studentProfile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  getStudentDashboard,
  getStudentById
};
