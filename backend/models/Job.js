const mongoose = require('mongoose');

// 1. Schema للـ Notes (نظام الملاحظات)
const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Note text is required'],
      trim: true,
      maxlength: [2000, 'Note cannot exceed 2000 characters'],
    },
  },
  { timestamps: true }
);

// 2. Schema للـ Documents (نظام الملفات)
const documentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  fileType: { type: String, trim: true, default: '' },
  uploadDate: { type: Date, default: Date.now },
  url: { type: String, trim: true, default: '' },
});

// 3. الـ Schema الأساسي للـ Job
const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // ضروري جداً للبحث السريع
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    salary: { type: String, trim: true, default: '' },
    jobUrl: { type: String, trim: true, default: '' },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'Interview', 'Rejected', 'Accepted'],
      default: 'Applied',
      index: true,
    },
    appliedDate: {
      type: Date,
      required: [true, 'Applied date is required'],
      default: Date.now,
    },
    richNotes: [noteSchema],
    interviewQuestions: [{
      type: String,
      trim: true,
      maxlength: [500, 'Question cannot exceed 500 characters'],
    }],
    documents: [documentSchema],
    
    // حقول التذكير الذكية
    lastStatusChange: {
      type: Date,
      default: Date.now,
      index: true, // مهم جداً للـ Cron Job
    },
    reminderSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Middleware: تحديث التاريخ تلقائياً عند تغيير الحالة
// jobSchema.pre('save', function (next) {
//   if (this.isModified('status')) {
//     this.lastStatusChange = new Date();
//     this.reminderSentAt = null; // إعادة ضبط التذكير عند تغيير الحالة
//   }
//   next();
// });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;