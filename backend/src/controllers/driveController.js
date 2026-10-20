const PlacementDrive = require('../models/PlacementDrive');
const Job = require('../models/Job');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Get all placement drives
 * GET /api/placement-drives
 */
const getDrives = async (req, res, next) => {
  try {
    const { status, academicYear } = req.query;
    const query = {};

    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    const drives = await PlacementDrive.find(query)
      .populate('participatingCompanies', 'name logo location size')
      .sort({ startDate: -1 });

    return res.status(200).json({
      success: true,
      count: drives.length,
      drives
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single placement drive by ID with associated jobs
 * GET /api/placement-drives/:id
 */
const getDriveById = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id)
      .populate('participatingCompanies', 'name logo website industry location');

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found.' });
    }

    const driveJobs = await Job.find({ drive: drive._id, status: 'open' })
      .populate('company', 'name logo');

    return res.status(200).json({
      success: true,
      drive,
      jobs: driveJobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new campus placement drive (Admin only)
 * POST /api/placement-drives
 */
const createDrive = async (req, res, next) => {
  try {
    const {
      title, description, academicYear, semester,
      startDate, endDate, eligibleBranches, minCgpa,
      maxBacklogs, participatingCompanies, coordinatorName, coordinatorEmail, bannerUrl
    } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Drive title, start date, and end date are required.' });
    }

    const drive = await PlacementDrive.create({
      title,
      description: description || '',
      academicYear: academicYear || '2025-2026',
      semester: semester || 'Campus Recruitment Drive',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      eligibleBranches: eligibleBranches || ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
      minCgpa: minCgpa !== undefined ? Number(minCgpa) : 6.5,
      maxBacklogs: maxBacklogs !== undefined ? Number(maxBacklogs) : 0,
      participatingCompanies: participatingCompanies || [],
      coordinatorName: coordinatorName || req.user.name,
      coordinatorEmail: coordinatorEmail || req.user.email,
      bannerUrl: bannerUrl || '',
      createdBy: req.user._id
    });

    await logAudit({
      user: req.user,
      action: 'CREATE_PLACEMENT_DRIVE',
      resourceType: 'PlacementDrive',
      resourceId: drive._id,
      details: { title: drive.title }
    });

    return res.status(201).json({
      success: true,
      message: 'Placement drive created successfully.',
      drive
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update placement drive (Admin only)
 * PUT /api/placement-drives/:id
 */
const updateDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found.' });
    }

    const updateFields = [
      'title', 'description', 'academicYear', 'semester', 'startDate', 'endDate',
      'eligibleBranches', 'minCgpa', 'maxBacklogs', 'participatingCompanies',
      'coordinatorName', 'coordinatorEmail', 'status', 'bannerUrl', 'isPublished'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        drive[field] = req.body[field];
      }
    });

    await drive.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_PLACEMENT_DRIVE',
      resourceType: 'PlacementDrive',
      resourceId: drive._id
    });

    return res.status(200).json({
      success: true,
      message: 'Placement drive updated successfully.',
      drive
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive
};
