const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs
} = require('../controllers/jobController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', getJobs);
router.get('/my', protect, authorize('recruiter', 'admin'), getMyJobs);
router.get('/:id', optionalAuth, getJobById);
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;
