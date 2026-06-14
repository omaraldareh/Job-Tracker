const nodemailer = require('nodemailer');

let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('⚠️  SMTP not configured — email reminders are disabled. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.');
    return null;
  }

  _transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', 
    requireTLS: true,                            
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS, 
    },


    pool: true,
    maxConnections: 1,   
    maxMessages: 50,     
    rateDelta: 1000,     
  });

  _transporter.verify((err) => {
    if (err) {
      console.error('❌ SMTP transporter verification failed:', err.message);
    } else {
      console.log('✅ SMTP transporter verified and ready (Brevo relay)');
    }
  });

  return _transporter;
};

/**
 * @param {object} opts
 * @param {string} opts.to         
 * @param {string} opts.userName   
 * @param {string} opts.company    
 * @param {string} opts.position   
 * @param {number} opts.daysSince  
 * @returns {Promise<boolean>} 
 */
const sendReminderEmail = async ({ to, userName, company, position, daysSince }) => {
  const transporter = getTransporter();
  if (!transporter) return false;

  const fromName = process.env.EMAIL_FROM_NAME || 'JobTrackr';
  const fromAddr = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER;

  const html = `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .wrapper { max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
    h2 { color: #4f46e5; }
  </style>
</head><body>
  <div class="wrapper">
    <h2>🚀 JobTrackr Reminder</h2>
    <p>Hi <strong>${userName.split(' ')[0]}</strong>,</p>
    <p>It's been <strong>${daysSince} days</strong> since you updated your application for:</p>
    <p style="background: #f4f4f4; padding: 10px; border-left: 4px solid #4f46e5;">
      <strong>Position:</strong> ${position}<br/>
      <strong>Company:</strong> ${company}
    </p>
    <p>This is a gentle reminder that it might be a good time to follow up with them.</p>
    <p>Best of luck with your job search!</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #888;">Automated reminder from JobTrackr.</p>
  </div>
</body></html>`;

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddr}>`,
      to,
      subject: `Follow up: ${position} at ${company}`,
      text: `Hi ${userName.split(' ')[0]},\n\nIt's been ${daysSince} days since you applied for ${position} at ${company}. It might be a good time to follow up.\n\nBest of luck,\nJobTrackr`,
      html,
    });

    console.log(`📧 Reminder sent to ${to} (messageId: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error(`❌ Email send failed to ${to}: ${err.message}`);
    return false;
  }
};

const closeTransporter = () => {
  if (_transporter) {
    _transporter.close();
    _transporter = null;
  }
};

module.exports = { sendReminderEmail, closeTransporter };