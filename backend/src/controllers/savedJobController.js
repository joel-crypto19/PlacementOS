const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

/**
 * Get student's saved / bookmarked opportunities
 * GET /api/saved-jobs
 */
const getSavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ student: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo location size industry' }
      })
      .sort({ savedAt: -1 });

    return res.status(200).json({
      success: true,
      count: saved.length,
      savedJobs: saved
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save job to wishlist
 * POST /api/saved-jobs/:jobId
 */
const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const existing = await SavedJob.findOne({ student: req.user._id, job: jobId });
    if (existing) {
      return res.status(200).json({ success: true, message: 'Job is already in your saved list.', savedJob: existing });
    }

    const savedJob = await SavedJob.create({
      student: req.user._id,
      job: jobId
    });

    return res.status(201).json({
      success: true,
      message: 'Job saved to wishlist.',
      savedJob
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove job from wishlist
 * DELETE /api/saved-jobs/:jobId
 */
const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    await SavedJob.findOneAndDelete({ student: req.user._id, job: jobId });

    return res.status(200).json({
      success: true,
      message: 'Job removed from saved list.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSavedJobs,
  saveJob,
  unsaveJob
};
