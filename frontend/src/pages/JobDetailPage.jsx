import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsApi, jobDetailsApi } from '../api';
import StatusBadge from '../components/common/StatusBadge';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatDate } from '../utils/constants';

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, icon }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-brand-400">{icon}</span>
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">{title}</h2>
    </div>
  );
}

// ── Notes Panel ───────────────────────────────────────────────────────────────
// Primary section of the Job Detail page. Supports add / edit / delete with
// optimistic, immediate list updates (no page refresh) and per-action loading
// feedback on buttons.
function NotesPanel({ jobId, notes, onUpdate, onError }) {
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingId, setSavingId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAdd = async () => {
    if (!text.trim() || adding) return;
    setAdding(true);
    try {
      const { data } = await jobDetailsApi.addNote(jobId, { text });
      onUpdate('richNotes', [...notes, data.note]);
      setText('');
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to add note');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (note) => {
    setEditId(note._id);
    setEditText(note.text);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
  };

  const handleSaveEdit = async (noteId) => {
    if (!editText.trim() || savingId) return;
    setSavingId(noteId);
    try {
      const { data } = await jobDetailsApi.updateNote(jobId, noteId, { text: editText });
      onUpdate('richNotes', notes.map(n => (n._id === noteId ? data.note : n)));
      cancelEdit();
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to update note');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await jobDetailsApi.deleteNote(jobId, deleteTarget);
      onUpdate('richNotes', notes.filter(n => n._id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to delete note');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Sort newest first so the most recent note is always visible up top
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="card p-6">
      <SectionHeader title="Notes" icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      } />

      {/* Add note */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a note… (e.g. recruiter contact, interview prep, follow-up reminders)"
          rows={2}
          className="input-base resize-none text-sm flex-1"
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAdd(); }}
          disabled={adding}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !text.trim()}
          className="btn-primary flex items-center justify-center gap-2 sm:self-end px-4 py-2 min-w-[96px]"
        >
          {adding ? <Spinner size="sm" /> : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          )}
          {adding ? 'Adding…' : 'Add Note'}
        </button>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {sortedNotes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 italic">No notes yet — add your first note above.</p>
          </div>
        )}

        {sortedNotes.map(note => {
          const isEditing = editId === note._id;
          const isSaving = savingId === note._id;

          return (
            <div key={note._id} className="bg-surface-muted rounded-lg p-4 border border-surface-border transition-colors">
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={3}
                    className="input-base resize-none text-sm"
                    autoFocus
                    disabled={isSaving}
                    onKeyDown={e => { if (e.key === 'Escape') cancelEdit(); }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(note._id)}
                      disabled={isSaving || !editText.trim()}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 min-w-[72px] justify-center"
                    >
                      {isSaving ? <Spinner size="sm" /> : null}
                      {isSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <p className="text-sm text-slate-300 flex-1 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(note)}
                      className="p-1.5 text-slate-500 hover:text-white hover:bg-surface-border rounded-md transition-colors"
                      title="Edit note"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(note._id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                      title="Delete note"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-600 mt-2">{formatDate(note.createdAt)}</p>
            </div>
          );
        })}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete note"
          message="This note will be permanently removed."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}

// ── Interview Questions Panel ─────────────────────────────────────────────────
function QuestionsPanel({ jobId, questions, onUpdate, onError }) {
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState(null);

  const handleAdd = async () => {
    if (!text.trim() || adding) return;
    setAdding(true);
    try {
      const { data } = await jobDetailsApi.addQuestion(jobId, { question: text });
      onUpdate('interviewQuestions', data.questions);
      setText('');
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to add question');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (idx) => {
    setDeletingIdx(idx);
    try {
      const { data } = await jobDetailsApi.deleteQuestion(jobId, idx);
      onUpdate('interviewQuestions', data.questions);
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to delete question');
    } finally {
      setDeletingIdx(null);
    }
  };

  return (
    <div className="card p-6">
      <SectionHeader title="Interview Questions" icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      } />

      <div className="space-y-2 mb-4">
        {questions.length === 0 && (
          <p className="text-sm text-slate-500 italic">No questions yet — add potential interview questions to prepare.</p>
        )}
        {questions.map((q, i) => (
          <div key={i} className="flex items-start gap-2 bg-surface-muted rounded-lg px-3 py-2 border border-surface-border group">
            <span className="text-brand-400 text-xs font-mono mt-0.5 flex-shrink-0">Q{i + 1}</span>
            <p className="text-sm text-slate-300 flex-1">{q}</p>
            <button
              onClick={() => handleDelete(i)}
              disabled={deletingIdx === i}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-red-400 transition-all disabled:opacity-100"
            >
              {deletingIdx === i ? (
                <Spinner size="sm" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add an interview question…"
          className="input-base text-sm flex-1"
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          disabled={adding}
        />
        <button onClick={handleAdd} disabled={adding || !text.trim()} className="btn-primary px-3 py-2">
          {adding ? <Spinner size="sm" /> : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    jobsApi.getOne(id)
      .then(({ data }) => setJob(data.job))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleUpdate = useCallback((field, value) => {
    setJob(j => ({ ...j, [field]: value }));
  }, []);

  const showError = useCallback((message) => {
    setToast({ type: 'error', message });
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20"><Spinner size="lg" className="text-brand-500" /></div>
  );
  if (!job) return null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <Toast {...toast} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/jobs" className="hover:text-slate-300 transition-colors">Applications</Link>
        <span>/</span>
        <span className="text-slate-300 truncate">{job.position} at {job.company}</span>
      </div>

      {/* Header card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center text-xl font-bold text-slate-300 flex-shrink-0">
            {job.company.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-white">{job.position}</h1>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-slate-400">{job.company} · {job.location}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
              {job.salary && <span>💰 {job.salary}</span>}
              <span>📅 Applied {formatDate(job.appliedDate)}</span>
              {job.jobUrl && (
                <a href={job.jobUrl} target="_blank" rel="noopener noreferrer"
                  className="text-brand-400 hover:text-brand-300">🔗 Job Posting</a>
              )}
            </div>
          </div>
          <Link to={`/jobs/${id}/edit`} className="btn-secondary flex items-center gap-2 flex-shrink-0 self-start">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </Link>
        </div>
      </div>

      {/* Notes — primary, full-width section */}
      <div className="space-y-5">
        <NotesPanel jobId={id} notes={job.richNotes || []} onUpdate={handleUpdate} onError={showError} />
        <QuestionsPanel jobId={id} questions={job.interviewQuestions || []} onUpdate={handleUpdate} onError={showError} />
      </div>
    </div>
  );
}