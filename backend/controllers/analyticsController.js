const Job = require('../models/Job');

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      statusBreakdown,
      applicationsPerMonth,
      topCompanies,
      totals,
    ] = await Promise.all([
      Job.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Job.aggregate([
        {
          $match: {
            user: userId,
            appliedDate: {
              $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$appliedDate' },
              month: { $month: '$appliedDate' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            count: 1,
          },
        },
      ]),

      // ── 3. Most applied-to companies (top 8) ─────────────────────────────
      Job.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$company', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, company: '$_id', count: 1 } },
      ]),

      Job.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            accepted: {
              $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] },
            },
            interview: {
              $sum: { $cond: [{ $eq: ['$status', 'Interview'] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] },
            },
            applied: {
              $sum: { $cond: [{ $eq: ['$status', 'Applied'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const monthlyMap = {};
    applicationsPerMonth.forEach(({ year, month, count }) => {
      monthlyMap[`${year}-${month}`] = count;
    });

    const monthLabels = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthLabels.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        count: monthlyMap[key] || 0,
      });
    }

    const kpis = totals[0] || { total: 0, accepted: 0, interview: 0, rejected: 0, applied: 0 };
    const successRate =
      kpis.total > 0 ? Math.round((kpis.accepted / kpis.total) * 100) : 0;
    const interviewRate =
      kpis.total > 0
        ? Math.round(((kpis.interview + kpis.accepted) / kpis.total) * 100)
        : 0;

    res.json({
      success: true,
      data: {
        kpis: { ...kpis, successRate, interviewRate },
        statusBreakdown: statusBreakdown.map(({ _id, count }) => ({
          status: _id,
          count,
        })),
        applicationsPerMonth: monthLabels,
        topCompanies,
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
};

module.exports = { getAnalytics };