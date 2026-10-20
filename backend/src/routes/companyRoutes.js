const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany
} = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.post('/', protect, authorize('admin', 'recruiter'), createCompany);
router.put('/:id', protect, authorize('admin', 'recruiter'), updateCompany);

module.exports = router;
