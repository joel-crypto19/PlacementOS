const Company = require('../models/Company');
const Job = require('../models/Job');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Get all verified companies (with optional search & pagination)
 * GET /api/companies
 */
const getCompanies = async (req, res, next) => {
  try {
    const { search, industry, location, page = 1, limit = 12 } = req.query;
    const query = {};

    // For public views, return verified companies or demo companies
    if (req.user?.role !== 'admin') {
      query.verificationStatus = 'verified';
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      companies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single company by ID or Slug
 * GET /api/companies/:id
 */
const getCompanyById = async (req, res, next) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    const company = await Company.findOne(query).populate('recruiters', 'name email');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Fetch active jobs from this company
    const activeJobs = await Job.find({
      $or: [{ company: company._id }, { companyName: company.name }],
      status: 'open'
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      company,
      activeJobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create company profile
 * POST /api/companies
 */
const createCompany = async (req, res, next) => {
  try {
    const { name, logo, description, industry, website, location, size, contactEmail } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Company name is required.' });
    }

    const existing = await Company.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A company with this name already exists.' });
    }

    const isAutoVerified = req.user.role === 'admin';

    const company = await Company.create({
      name,
      logo: logo || '',
      description: description || '',
      industry: industry || 'Technology',
      website: website || '',
      location: location || '',
      size: size || '51-200',
      contactEmail: contactEmail || req.user.email,
      verificationStatus: isAutoVerified ? 'verified' : 'pending',
      createdBy: req.user._id,
      recruiters: [req.user._id]
    });

    // Link user to company if recruiter
    if (req.user.role === 'recruiter' && !req.user.company) {
      req.user.company = company._id;
      await req.user.save();
    }

    await logAudit({
      user: req.user,
      action: 'CREATE_COMPANY',
      resourceType: 'Company',
      resourceId: company._id,
      details: { name: company.name }
    });

    return res.status(201).json({
      success: true,
      message: isAutoVerified
        ? 'Company created and verified successfully.'
        : 'Company profile created. Pending placement cell verification.',
      company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update company profile
 * PUT /api/companies/:id
 */
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Ensure authorized: admin or company recruiter
    const isOwner = company.recruiters.some(r => r.toString() === req.user._id.toString()) ||
                    company.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this company profile.' });
    }

    const allowedUpdates = ['name', 'logo', 'description', 'industry', 'website', 'location', 'size', 'contactEmail'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        company[field] = req.body[field];
      }
    });

    await company.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_COMPANY',
      resourceType: 'Company',
      resourceId: company._id
    });

    return res.status(200).json({
      success: true,
      message: 'Company profile updated successfully.',
      company
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany
};
