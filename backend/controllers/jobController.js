const Job = require('../models/Job');


const getJobs = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const query = { user: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.company = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(query),
    ]);

    const stats = await Job.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {
      total: 0,
      Applied: 0,
      Interview: 0,
      Rejected: 0,
      Accepted: 0,
    };

    stats.forEach(({ _id, count }) => {
      statsMap[_id] = count;
      statsMap.total += count;
    });

    res.json({
      success: true,
      count: jobs.length,
      total,
      stats: statsMap,
      jobs,
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, message: 'Error fetching jobs' });
  }
};

const getJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user._id });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching job' });
  }
};

const createJob = async (req, res) => {
  try {
    const { company, position, location, salary, jobUrl, notes, status, appliedDate } = req.body;

    const job = await Job.create({
      user: req.user._id,
      company,
      position,
      location,
      salary: salary || '',
      jobUrl: jobUrl || '',
      notes: notes || '',
      status: status || 'Applied',
      appliedDate: appliedDate || Date.now(),
    });

    res.status(201).json({ success: true, message: 'Job added successfully', job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ success: false, message: 'Error creating job' });
  }
};

const updateJob = async (req, res) => {
  try {
    let job = await Job.findOne({ _id: req.params.id, user: req.user._id });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ success: false, message: 'Error updating job' });
  }
};
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user._id });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    await job.deleteOne();

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ success: false, message: 'Error deleting job' });
  }
};

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob };
