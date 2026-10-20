const express = require('express');
const router = express.Router();
const { getSavedJobs, saveJob, unsaveJob } = require('../controllers/savedJobController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, authorize('student'), getSavedJobs);
router.post('/:jobId', protect, authorize('student'), saveJob);
router.delete('/:jobId', protect, authorize('student'), unsaveJob);

module.exports = router;
