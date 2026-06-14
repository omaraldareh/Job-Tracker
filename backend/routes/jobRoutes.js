const express = require('express');
const { body } = require('express-validator');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

const jobValidation = [
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('status')
    .optional()
    .isIn(['Applied', 'Interview', 'Rejected', 'Accepted'])
    .withMessage('Invalid status'),
  body('appliedDate').optional().isISO8601().withMessage('Invalid date format'),
];

router.route('/').get(getJobs).post(jobValidation, validate, createJob);
router.route('/:id').get(getJob).put(jobValidation, validate, updateJob).delete(deleteJob);

module.exports = router;
