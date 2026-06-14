const mongoose = require('mongoose');
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

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  fileType: { type: String, trim: true, default: '' },
  uploadDate: { type: Date, default: Date.now },
  url: { type: String, trim: true, default: '' },
});

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, 
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
    
    lastStatusChange: {
      type: Date,
      default: Date.now,
      index: true, 
    },
    reminderSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


const Job = mongoose.model('Job', jobSchema);

module.exports = Job;