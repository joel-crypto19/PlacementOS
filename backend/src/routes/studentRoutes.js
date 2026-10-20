const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  getStudentDashboard,
  getStudentById
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { uploadResume: uploadMiddleware } = require('../middleware/upload');

// Student personal profile and dashboard
router.get('/profile', protect, authorize('student'), getMyProfile);
router.put('/profile', protect, authorize('student'), updateMyProfile);
router.post('/resume', protect, authorize('student'), uploadMiddleware.single('resume'), uploadResume);
router.get('/dashboard', protect, authorize('student'), getStudentDashboard);

// Lookup student profile (Recruiter or Admin)
router.get('/:id', protect, authorize('admin', 'recruiter'), getStudentById);

module.exports = router;
