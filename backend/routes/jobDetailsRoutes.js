const express = require('express');
const {
  addNote, updateNote, deleteNote,
  addQuestion, deleteQuestion,
  addDocument, deleteDocument,
} = require('../controllers/jobDetailsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(protect);

// Notes
router.post('/notes', addNote);
router.put('/notes/:noteId', updateNote);
router.delete('/notes/:noteId', deleteNote);

// Interview questions
router.post('/questions', addQuestion);
router.delete('/questions/:index', deleteQuestion);

// Document references
router.post('/documents', addDocument);
router.delete('/documents/:docId', deleteDocument);

module.exports = router;