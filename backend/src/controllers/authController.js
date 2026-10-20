const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const env = require('../config/env');
const { logAudit } = require('../middleware/auditLogger');
const { createNotification } = require('../services/notificationService');

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

/**
 * Register student or recruiter
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, phone, university, branch, graduationYear, cgpa } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const selectedRole = ['student', 'recruiter', 'admin'].includes(role) ? role : 'student';

    // Prevent direct unauthorized registration as admin unless database is empty
    let finalRole = selectedRole;
    if (selectedRole === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount > 0) {
        return res.status(403).json({ success: false, message: 'Administrator accounts must be provisioned by an existing administrator.' });
      }
    }

    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role: finalRole,
      phone: phone || '',
      status: finalRole === 'recruiter' ? 'pending' : 'active',
      isVerified: finalRole !== 'recruiter'
    };

    if (finalRole === 'recruiter') {
      userData.requestedCompanyName = companyName || 'Company';
    }

    const user = await User.create(userData);

    // If student, initialize profile
    if (finalRole === 'student') {
      await StudentProfile.create({
        user: user._id,
        fullName: name,
        collegeEmail: email.toLowerCase(),
        university: university || 'National Institute of Technology',
        branch: branch || 'Computer Science & Engineering',
        graduationYear: graduationYear ? Number(graduationYear) : 2026,
        cgpa: cgpa ? Number(cgpa) : 8.0,
        skills: ['JavaScript', 'Problem Solving', 'Data Structures']
      });
    }

    // If recruiter requested a company, either link or stage company
    if (finalRole === 'recruiter' && companyName) {
      let company = await Company.findOne({ name: new RegExp(`^${companyName}$`, 'i') });
      if (!company) {
        company = await Company.create({
          name: companyName,
          verificationStatus: 'pending',
          createdBy: user._id,
          recruiters: [user._id]
        });
      }
      user.company = company._id;
      await user.save();
    }

    await logAudit({
      user,
      action: 'USER_REGISTER',
      resourceType: 'User',
      resourceId: user._id,
      details: { role: finalRole, email: user.email }
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        company: user.company
      },
      message: finalRole === 'recruiter'
        ? 'Recruiter registration successful! Account access is pending placement cell verification.'
        : 'Registration successful!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('company');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by administration.' });
    }

    user.lastLogin = new Date();
    await user.save();

    await logAudit({
      user,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user._id,
      details: { role: user.role }
    });

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        avatar: user.avatar,
        company: user.company
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('company');
    let profile = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user info
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, password, currentPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to change password.' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password does not match.' });
      }
      user.password = password;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Account details updated successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
