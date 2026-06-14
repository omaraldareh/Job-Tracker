const cron = require('node-cron');
const Job = require('../models/Job');
const { sendReminderEmail } = require('./emailService');

const REMINDER_DAYS = parseInt(process.env.REMINDER_DAYS || '14', 10);
const TERMINAL_STATUSES = ['Rejected', 'Accepted']; // don't remind on closed apps


const SEND_DELAY_MS = parseInt(process.env.REMINDER_SEND_DELAY_MS || '1200', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runReminderJob = async () => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - REMINDER_DAYS);

    const staleJobs = await Job.find({
      status: { $nin: TERMINAL_STATUSES },
      lastStatusChange: { $lte: cutoff },
      $or: [
        { reminderSentAt: null },
        { reminderSentAt: { $lte: cutoff } },
      ],
    }).populate('user', 'name email');

    if (staleJobs.length === 0) {
      console.log('[Cron] No stale jobs found — skipping reminder run.');
      return;
    }

    console.log(`[Cron] Found ${staleJobs.length} stale job(s). Sending reminders…`);

    let sent = 0;
    let failed = 0;

    for (const job of staleJobs) {
      if (!job.user || !job.user.email) continue;

      const daysSince = Math.floor(
        (Date.now() - new Date(job.lastStatusChange).getTime()) / (1000 * 60 * 60 * 24)
      );

      const ok = await sendReminderEmail({
        to: job.user.email,
        userName: job.user.name,
        company: job.company,
        position: job.position,
        daysSince,
      });

      if (ok) {
        job.reminderSentAt = new Date();
        await job.save();
        sent++;
      } else {
        failed++;
      }

      if (staleJobs.indexOf(job) < staleJobs.length - 1) {
        await sleep(SEND_DELAY_MS);
      }
    }

    console.log(`[Cron] Reminders sent: ${sent}, failed: ${failed}`);
  } catch (err) {
    console.error('[Cron] Reminder job crashed:', err.message);
  }
};

const startReminderCron = () => {
  const schedule = process.env.REMINDER_CRON || '0 8 * * *';

  cron.schedule(schedule, runReminderJob, {
    scheduled: true,
    timezone: process.env.TZ || 'UTC',
  });

  console.log(`✅ Reminder cron scheduled: "${schedule}"`);

  if (process.env.NODE_ENV === 'development' && process.env.CRON_RUN_ON_START === 'true') {
    console.log('[Cron] Running immediately (CRON_RUN_ON_START=true)…');
    runReminderJob();
  }
};

module.exports = { startReminderCron, runReminderJob };