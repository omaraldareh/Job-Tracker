const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB().then(() => {
  const { startReminderCron } = require('./services/reminderCron');
  startReminderCron();
});

const app = express();

app.use(express.json());

app.use(cors({
  origin: 'https://job-tracker-eight-bay.vercel.app', 
  credentials: true,
}));

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/jobs',      require('./routes/jobRoutes'));
app.use('/api/jobs/:id',  require('./routes/jobDetailsRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'JobTrackr API v2 running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

const shutdown = () => {
  console.log('\nShutting down…');
  const { closeTransporter } = require('./services/emailService');
  closeTransporter();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);