const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getMyInterviews,
  updateInterview
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.post('/', protect, authorize('recruiter', 'admin'), scheduleInterview);
router.get('/my', protect, getMyInterviews);
router.patch('/:id', protect, authorize('recruiter', 'admin'), updateInterview);

module.exports = router;
