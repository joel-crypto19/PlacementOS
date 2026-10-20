const Job = require('../models/Job');
const Company = require('../models/Company');
const StudentProfile = require('../models/StudentProfile');
const { checkEligibility } = require('../services/eligibilityService');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Get all jobs with robust search, filtering, and pagination
 * GET /api/jobs
 */
const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      jobType,
      workMode,
      location,
      minSalary,
      branch,
      graduationYear,
      deadlineUpcoming,
      sourceProvider,
      isDemo,
      sortBy = 'newest',
      page = 1,
      limit = 10,
      status = 'open'
    } = req.query;

    const query = {};

    // Filter by status (default 'open')
    if (status !== 'all') {
      query.status = status;
    }

    // Keyword search (title, description, skills, company)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { skillsRequired: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Job Type filter (internship vs full-time)
    if (jobType) {
      query.jobType = jobType;
    }

    // Work Mode (remote, hybrid, onsite)
    if (workMode) {
      query.workMode = workMode;
    }

    // Location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Min salary
    if (minSalary) {
      query['salaryOrStipend.min'] = { $gte: Number(minSalary) };
    }

    // Branch eligibility filter
    if (branch) {
      query.$or = [
        { 'eligibility.allowedBranches': { $size: 0 } },
        { 'eligibility.allowedBranches': { $in: [new RegExp(branch, 'i')] } }
      ];
    }

    // Graduation year
    if (graduationYear) {
      query.$or = [
        { 'eligibility.allowedGraduationYears': { $size: 0 } },
        { 'eligibility.allowedGraduationYears': Number(graduationYear) }
      ];
    }

    // Deadline filter: only future deadlines
    if (deadlineUpcoming === 'true') {
      query.applicationDeadline = { $gte: new Date() };
    }

    // Source Provider
    if (sourceProvider) {
      query.sourceProvider = sourceProvider;
    }

    if (isDemo !== undefined) {
      query.isDemo = isDemo === 'true';
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sortBy === 'deadline') {
      sortObj = { applicationDeadline: 1 };
    } else if (sortBy === 'salary') {
      sortObj = { 'salaryOrStipend.max': -1 };
    } else if (sortBy === 'views') {
      sortObj = { viewsCount: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('company', 'name logo verificationStatus size industry')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      jobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get job details with eligibility calculation for current user
 * GET /api/jobs/:id
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo verificationStatus size industry website')
      .populate('drive', 'title academicYear');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found.' });
    }

    // Increment view count
    job.viewsCount = (job.viewsCount || 0) + 1;
    await job.save();

    let eligibilityResult = null;

    // If request user is a student, evaluate eligibility in real-time
    if (req.user && req.user.role === 'student') {
      const profile = await StudentProfile.findOne({ user: req.user._id });
      eligibilityResult = checkEligibility(profile, job);
    }

    return res.status(200).json({
      success: true,
      job,
      eligibility: eligibilityResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new job listing (Recruiter or Admin)
 * POST /api/jobs
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      companyId,
      companyName,
      companyLogo,
      description,
      responsibilities,
      requirements,
      skillsRequired,
      jobType,
      workMode,
      location,
      salaryOrStipend,
      eligibility,
      applicationDeadline,
      applicationMethod,
      externalUrl,
      driveId
    } = req.body;

    if (!title || !description || !location || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, location, and application deadline.'
      });
    }

    let finalCompanyName = companyName;
    let finalCompanyLogo = companyLogo || '';
    let finalCompanyId = companyId || null;

    if (req.user.role === 'recruiter') {
      if (req.user.company) {
        const company = await Company.findById(req.user.company);
        if (company) {
          finalCompanyId = company._id;
          finalCompanyName = company.name;
          finalCompanyLogo = company.logo || '';
        }
      }
    }

    if (!finalCompanyName) {
      return res.status(400).json({ success: false, message: 'Company name is required.' });
    }

    const job = await Job.create({
      title,
      company: finalCompanyId,
      companyName: finalCompanyName,
      companyLogo: finalCompanyLogo,
      description,
      responsibilities: responsibilities || [],
      requirements: requirements || [],
      skillsRequired: skillsRequired || [],
      jobType: jobType || 'full-time',
      workMode: workMode || 'onsite',
      location,
      salaryOrStipend: salaryOrStipend || { min: 0, max: 0, currency: 'INR', period: 'yearly', isDisclosed: true },
      eligibility: eligibility || { minCgpa: 0, allowedBranches: [], allowedGraduationYears: [], maxBacklogs: 0 },
      applicationOpeningDate: new Date(),
      applicationDeadline: new Date(applicationDeadline),
      applicationMethod: applicationMethod || 'internal',
      externalUrl: externalUrl || '',
      drive: driveId || null,
      status: 'open',
      sourceProvider: 'direct',
      createdBy: req.user._id,
      lastVerifiedAt: new Date()
    });

    await logAudit({
      user: req.user,
      action: 'CREATE_JOB',
      resourceType: 'Job',
      resourceId: job._id,
      details: { title: job.title, company: job.companyName }
    });

    return res.status(201).json({
      success: true,
      message: 'Job listing published successfully.',
      job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update job listing
 * PUT /api/jobs/:id
 */
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found.' });
    }

    // Permission check: admin or creator recruiter
    const isOwner = job.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this job listing.' });
    }

    const fieldsToUpdate = [
      'title', 'description', 'responsibilities', 'requirements', 'skillsRequired',
      'jobType', 'workMode', 'location', 'salaryOrStipend', 'eligibility',
      'applicationDeadline', 'applicationMethod', 'externalUrl', 'status', 'drive'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    job.lastVerifiedAt = new Date();
    await job.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_JOB',
      resourceType: 'Job',
      resourceId: job._id
    });

    return res.status(200).json({
      success: true,
      message: 'Job listing updated successfully.',
      job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete or archive job listing
 * DELETE /api/jobs/:id
 */
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found.' });
    }

    const isOwner = job.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this job listing.' });
    }

    await job.deleteOne();

    await logAudit({
      user: req.user,
      action: 'DELETE_JOB',
      resourceType: 'Job',
      resourceId: job._id,
      details: { title: job.title }
    });

    return res.status(200).json({
      success: true,
      message: 'Job listing deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get jobs created by current recruiter
 * GET /api/jobs/my
 */
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs
};
