/**
 * Reminder Cron Service
 * Runs daily at 8:00 AM to find stale job applications and send follow-up emails.
 * "Stale" = status unchanged for >= REMINDER_DAYS (default 14) and still open.
 *
 * Design choices:
 *  - Uses node-cron (no blocking)
 *  - Skips already-reminded jobs (reminderSentAt within the last REMINDER_DAYS window)
 *  - Populates user email via Job.populate('user')
 *  - Wrapped in try/catch so cron failures never crash the server
 */
const cron = require('node-cron');
const Job = require('../models/Job');
const { sendReminderEmail } = require('./emailService');

const REMINDER_DAYS = parseInt(process.env.REMINDER_DAYS || '14', 10);
const TERMINAL_STATUSES = ['Rejected', 'Accepted']; // don't remind on closed apps

// Minimum gap between consecutive sends, on top of the transporter's own
// `rateLimit` setting. Acts as a safety net if the pool config is ever
// changed, and keeps logs readable during large batch runs.
const SEND_DELAY_MS = parseInt(process.env.REMINDER_SEND_DELAY_MS || '1200', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runReminderJob = async () => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - REMINDER_DAYS);

    // Jobs that:
    //  1. Are not in a terminal state
    //  2. Haven't changed status in >= REMINDER_DAYS
    //  3. Either never had a reminder sent, or last reminder was >REMINDER_DAYS ago
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

      // Throttle: wait between sends so we never burst past Brevo's
      // per-second limit, regardless of how many stale jobs are found.
      if (staleJobs.indexOf(job) < staleJobs.length - 1) {
        await sleep(SEND_DELAY_MS);
      }
    }

    console.log(`[Cron] Reminders sent: ${sent}, failed: ${failed}`);
  } catch (err) {
    console.error('[Cron] Reminder job crashed:', err.message);
  }
};

/**
 * Initialise and start the cron schedule.
 * Called once from server.js after DB connects.
 */
const startReminderCron = () => {
  // Run daily at 08:00 server time
  const schedule = process.env.REMINDER_CRON || '0 8 * * *';

  cron.schedule(schedule, runReminderJob, {
    scheduled: true,
    timezone: process.env.TZ || 'UTC',
  });

  console.log(`✅ Reminder cron scheduled: "${schedule}"`);

  // Optionally run immediately on startup in dev so you can test without waiting
  if (process.env.NODE_ENV === 'development' && process.env.CRON_RUN_ON_START === 'true') {
    console.log('[Cron] Running immediately (CRON_RUN_ON_START=true)…');
    runReminderJob();
  }
};

module.exports = { startReminderCron, runReminderJob };