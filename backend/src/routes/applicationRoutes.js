const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.post('/', protect, authorize('student'), applyForJob);
router.get('/me', protect, authorize('student'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplications);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.post('/:id/withdraw', protect, authorize('student'), withdrawApplication);

module.exports = router;
