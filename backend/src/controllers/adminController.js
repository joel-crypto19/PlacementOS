const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const PlacementDrive = require('../models/PlacementDrive');
const AuditLog = require('../models/AuditLog');
const DataSource = require('../models/DataSource');
const { createNotification } = require('../services/notificationService');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Get comprehensive, real-data administrative analytics
 * GET /api/admin/analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const pendingRecruiters = await User.countDocuments({ role: 'recruiter', status: 'pending' });
    const totalCompanies = await Company.countDocuments();
    const verifiedCompanies = await Company.countDocuments({ verificationStatus: 'verified' });

    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'open' });
    const directJobs = await Job.countDocuments({ sourceProvider: 'direct' });
    const importedJobs = await Job.countDocuments({ sourceProvider: { $ne: 'direct' } });

    const totalApplications = await Application.countDocuments();

    // Applications count by status
    const statusCountsRaw = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusBreakdown = {
      applied: 0,
      under_review: 0,
      shortlisted: 0,
      assessment: 0,
      interview_scheduled: 0,
      selected: 0,
      rejected: 0,
      withdrawn: 0
    };

    statusCountsRaw.forEach(item => {
      if (statusBreakdown[item._id] !== undefined) {
        statusBreakdown[item._id] = item.count;
      }
    });

    // Recruitment Funnel metrics
    const funnel = [
      { stage: 'Applications Submitted', count: totalApplications },
      { stage: 'Under Review', count: statusBreakdown.under_review + statusBreakdown.shortlisted + statusBreakdown.assessment + statusBreakdown.interview_scheduled + statusBreakdown.selected },
      { stage: 'Shortlisted / Assessment', count: statusBreakdown.shortlisted + statusBreakdown.assessment + statusBreakdown.interview_scheduled + statusBreakdown.selected },
      { stage: 'Interview Stage', count: statusBreakdown.interview_scheduled + statusBreakdown.selected },
      { stage: 'Offers / Selected', count: statusBreakdown.selected }
    ];

    // Most in-demand skills from real job listings
    const skillsAggregation = await Job.aggregate([
      { $unwind: '$skillsRequired' },
      { $group: { _id: '$skillsRequired', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    const topSkills = skillsAggregation.map(s => ({
      skill: s._id,
      count: s.count
    }));

    // Placement drive stats
    const totalDrives = await PlacementDrive.countDocuments();
    const ongoingDrives = await PlacementDrive.countDocuments({ status: 'ongoing' });

    // Data sources status
    const dataSources = await DataSource.find().select('name providerKey isConfigured lastSyncStatus lastSyncAt totalImportedCount');

    // Real placement rate (students with at least one 'selected' application / total active students)
    const placedStudentsRaw = await Application.distinct('student', { status: 'selected' });
    const placedCount = placedStudentsRaw.length;
    const placementRate = totalStudents > 0 ? Number(((placedCount / totalStudents) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      analytics: {
        students: { total: totalStudents, placed: placedCount, placementRate },
        recruiters: { total: totalRecruiters, pending: pendingRecruiters },
        companies: { total: totalCompanies, verified: verifiedCompanies },
        jobs: { total: totalJobs, active: activeJobs, direct: directJobs, imported: importedJobs },
        applications: { total: totalApplications, breakdown: statusBreakdown, funnel },
        topSkills,
        drives: { total: totalDrives, ongoing: ongoingDrives },
        dataSources
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage all users with search, role filters, and pagination
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { requestedCompanyName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('company', 'name verificationStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or reject recruiter / change user status
 * PATCH /api/admin/users/:id/status
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const allowed = ['active', 'pending', 'rejected', 'suspended'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.status = status;
    user.isVerified = status === 'active';

    // If recruiter approved and has company, verify company too
    if (user.role === 'recruiter' && status === 'active' && user.company) {
      await Company.findByIdAndUpdate(user.company, { verificationStatus: 'verified' });
    }

    await user.save();

    // Send notification to user
    await createNotification({
      recipient: user._id,
      title: `Account Status: ${status.toUpperCase()}`,
      message: status === 'active'
        ? 'Your recruiter account has been verified and approved by the placement cell!'
        : `Your account status was updated to ${status}. ${note || ''}`,
      type: 'system',
      link: '/login'
    });

    await logAudit({
      user: req.user,
      action: 'ADMIN_UPDATE_USER_STATUS',
      resourceType: 'User',
      resourceId: user._id,
      details: { targetEmail: user.email, newStatus: status, note }
    });

    return res.status(200).json({
      success: true,
      message: `User status updated to '${status}'.`,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify or reject company
 * PATCH /api/admin/companies/:id/verification
 */
const updateCompanyVerification = async (req, res, next) => {
  try {
    const { verificationStatus } = req.body;
    if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status.' });
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    company.verificationStatus = verificationStatus;
    await company.save();

    await logAudit({
      user: req.user,
      action: 'ADMIN_UPDATE_COMPANY_VERIFICATION',
      resourceType: 'Company',
      resourceId: company._id,
      details: { companyName: company.name, newStatus: verificationStatus }
    });

    return res.status(200).json({
      success: true,
      message: `Company '${company.name}' verification set to ${verificationStatus}.`,
      company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs for administrative review
 * GET /api/admin/audit-logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, resourceType, page = 1, limit = 25 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      logs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export applications as CSV
 * GET /api/admin/export/applications
 */
const exportApplicationsCSV = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title companyName jobType location')
      .sort({ appliedAt: -1 });

    const headers = ['Application ID', 'Candidate Name', 'College Email', 'Degree', 'Branch', 'Graduation Year', 'CGPA', 'Job Title', 'Company', 'Job Type', 'Status', 'Applied At'];
    
    const rows = applications.map(app => [
      `"${app._id}"`,
      `"${app.profileSnapshot?.fullName || ''}"`,
      `"${app.profileSnapshot?.collegeEmail || ''}"`,
      `"${app.profileSnapshot?.degree || ''}"`,
      `"${app.profileSnapshot?.branch || ''}"`,
      app.profileSnapshot?.graduationYear || '',
      app.profileSnapshot?.cgpa || '',
      `"${app.job?.title || 'Unknown'}"`,
      `"${app.job?.companyName || 'Unknown'}"`,
      `"${app.job?.jobType || ''}"`,
      `"${app.status}"`,
      `"${new Date(app.appliedAt).toISOString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=placementos-applications-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * Export student profiles as CSV
 * GET /api/admin/export/students
 */
const exportStudentsCSV = async (req, res, next) => {
  try {
    const profiles = await StudentProfile.find()
      .populate('user', 'email phone lastLogin')
      .sort({ graduationYear: 1, fullName: 1 });

    const headers = ['Student ID', 'Full Name', 'College Email', 'Phone', 'Degree', 'Branch', 'Graduation Year', 'CGPA', 'Backlogs', 'Skills', 'Completeness %'];

    const rows = profiles.map(p => [
      `"${p.user?._id || p._id}"`,
      `"${p.fullName || ''}"`,
      `"${p.collegeEmail || p.user?.email || ''}"`,
      `"${p.phone || p.user?.phone || ''}"`,
      `"${p.degree || ''}"`,
      `"${p.branch || ''}"`,
      p.graduationYear || '',
      p.cgpa || '',
      p.backlogs || 0,
      `"${(p.skills || []).join('; ')}"`,
      p.calculateCompleteness()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=placementos-students-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getUsers,
  updateUserStatus,
  updateCompanyVerification,
  getAuditLogs,
  exportApplicationsCSV,
  exportStudentsCSV
};
