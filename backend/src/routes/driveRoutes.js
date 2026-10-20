const express = require('express');
const router = express.Router();
const {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive
} = require('../controllers/driveController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', getDrives);
router.get('/:id', getDriveById);
router.post('/', protect, authorize('admin'), createDrive);
router.put('/:id', protect, authorize('admin'), updateDrive);

module.exports = router;
