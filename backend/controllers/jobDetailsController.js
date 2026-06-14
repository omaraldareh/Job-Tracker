const Job = require('../models/Job');

const findOwnedJob = async (jobId, userId) => {
  const job = await Job.findOne({ _id: jobId, user: userId });
  return job; // null if not found / not owned
};


const addNote = async (req, res) => {
  try {
    const job = await findOwnedJob(req.params.id, req.user._id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    job.richNotes.push({ text: text.trim() });
    await job.save();

    const newNote = job.richNotes[job.richNotes.length - 1];
    res.status(201).json({ success: true, note: newNote });
  } catch (err) {
    console.error('addNote error:', err);
    res.status(500).json({ success: false, message: 'Error adding note' });
  }
};

const updateNote = async (req, res) => {
  try {
    const job = await findOwnedJob(req.params.id, req.user._id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const note = job.richNotes.id(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    note.text = text.trim();
    await job.save();

    res.json({ success: true, note });
  } catch (err) {
    console.error('updateNote error:', err);
    res.status(500).json({ success: false, message: 'Error updating note' });
  }
};


const deleteNote = async (req, res) => {
  try {
    const job = await findOwnedJob(req.params.id, req.user._id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const note = job.richNotes.id(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    note.deleteOne();
    await job.save();

    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    console.error('deleteNote error:', err);
    res.status(500).json({ success: false, message: 'Error deleting note' });
  }
};
const addQuestion = async (req, res) => {
  try {
    const job = await findOwnedJob(req.params.id, req.user._id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question text is required' });
    }

    job.interviewQuestions.push(question.trim());
    await job.save();

    res.status(201).json({
      success: true,
      questions: job.interviewQuestions,
    });
  } catch (err) {
    console.error('addQuestion error:', err);
    res.status(500).json({ success: false, message: 'Error adding question' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const job = await findOwnedJob(req.params.id, req.user._id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || idx < 0 || idx >= job.interviewQuestions.length) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    job.interviewQuestions.splice(idx, 1);
    await job.save();

    res.json({ success: true, questions: job.interviewQuestions });
  } catch (err) {
    console.error('deleteQuestion error:', err);
    res.status(500).json({ success: false, message: 'Error deleting question' });
  }
};

const addDocument = async (req, res) => {
  try {
    const job = await findOwnedJob(req.params.id, req.user._id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const { name, fileType, url } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Document name is required' });
    }

    job.documents.push({ name: name.trim(), fileType: fileType || '', url: url || '' });
    await job.save();

    const newDoc = job.documents[job.documents.length - 1];
    res.status(201).json({ success: true, document: newDoc });
  } catch (err) {
    console.error('addDocument error:', err);
    res.status(500).json({ success: false, message: 'Error adding document' });
  }
};


const deleteDocument = async (req, res) => {
  try {
    const job = await findOwnedJob(req.params.id, req.user._id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const doc = job.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    doc.deleteOne();
    await job.save();

    res.json({ success: true, message: 'Document removed' });
  } catch (err) {
    console.error('deleteDocument error:', err);
    res.status(500).json({ success: false, message: 'Error deleting document' });
  }
};

module.exports = {
  addNote, updateNote, deleteNote,
  addQuestion, deleteQuestion,
  addDocument, deleteDocument,
};