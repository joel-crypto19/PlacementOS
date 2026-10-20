const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getUsers,
  updateUserStatus,
  updateCompanyVerification,
  getAuditLogs,
  exportApplicationsCSV,
  exportStudentsCSV
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/companies/:id/verification', updateCompanyVerification);
router.get('/audit-logs', getAuditLogs);
router.get('/export/applications', exportApplicationsCSV);
router.get('/export/students', exportStudentsCSV);

module.exports = router;
