const express = require('express');
const router = express.Router();
const {
  getDataSources,
  triggerSync,
  getSyncLogs
} = require('../controllers/syncController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/sources', protect, authorize('admin'), getDataSources);
router.post('/trigger/:providerKey', protect, authorize('admin'), triggerSync);
router.get('/logs', protect, authorize('admin'), getSyncLogs);

module.exports = router;
