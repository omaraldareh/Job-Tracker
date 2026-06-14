import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jobsApi } from '../api';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';
import Spinner from '../components/common/Spinner';
import { STATUSES, formatDate } from '../utils/constants';

const FILTER_OPTIONS = ['All', ...STATUSES];

export default function JobsPage() {
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(location.state?.toast || null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;
      const { data } = await jobsApi.getAll(params);
      setJobs(data.jobs);
      setStats(data.stats);
    } catch {
      setToast({ type: 'error', message: 'Failed to load applications' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchJobs, 300);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await jobsApi.delete(deleteTarget._id);
      setJobs(j => j.filter(x => x._id !== deleteTarget._id));
      setToast({ type: 'success', message: 'Application deleted' });
    } catch {
      setToast({ type: 'error', message: 'Failed to delete' });
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <Toast {...toast} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Applications</h1>
          <p className="text-slate-400 text-sm mt-1">
            {stats.total ?? 0} total application{stats.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/jobs/new" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Job
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by company name…" className="input-base pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map(opt => (
            <button key={opt} onClick={() => setStatusFilter(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                statusFilter === opt
                  ? 'bg-brand-600 text-white border-brand-500'
                  : 'bg-surface-muted text-slate-400 border-surface-border hover:text-white hover:border-slate-500'
              }`}
            >{opt}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" className="text-brand-500" /></div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-300 font-medium">No applications found</p>
          <p className="text-slate-500 text-sm mt-1">
            {search || statusFilter !== 'All' ? 'Try adjusting your search or filters' : 'Start tracking your first application'}
          </p>
          {!search && statusFilter === 'All' && (
            <Link to="/jobs/new" className="btn-primary inline-flex items-center gap-2 mt-5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add your first job
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-surface-border">
            <div className="col-span-3">Role & Company</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-1">Salary</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Applied</div>
            <div className="col-span-2">Notes</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="divide-y divide-surface-border">
            {jobs.map(job => (
              <div key={job._id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 hover:bg-surface-muted/30 transition-colors items-center group">
                <Link to={`/jobs/${job._id}`} className="sm:col-span-3 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center flex-shrink-0 text-sm font-semibold text-slate-300 group-hover:bg-brand-600/20 group-hover:text-brand-300 transition-colors">
                    {job.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate hover:text-brand-300 transition-colors">{job.position}</p>
                    <p className="text-xs text-slate-500 truncate">{job.company}</p>
                  </div>
                </Link>
                <div className="sm:col-span-2"><p className="text-xs text-slate-400 truncate">{job.location}</p></div>
                <div className="sm:col-span-1"><p className="text-xs text-slate-500 truncate">{job.salary || '—'}</p></div>
                <div className="sm:col-span-2"><StatusBadge status={job.status} /></div>
                <div className="sm:col-span-1"><p className="text-xs text-slate-600">{formatDate(job.appliedDate)}</p></div>
                <div className="sm:col-span-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors w-full sm:w-auto justify-center ${
                      job.notes
                        ? 'bg-brand-600/10 text-brand-300 border-brand-600/30 hover:bg-brand-600/20 hover:border-brand-500/50'
                        : 'bg-surface-muted text-slate-400 border-surface-border hover:text-white hover:border-slate-500'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V18a2 2 0 01-2 2z" />
                    </svg>
                    View/Add
                  </Link>
                </div>
                <div className="sm:col-span-1 flex items-center justify-end gap-1">
                  {job.jobUrl && (
                    <a href={job.jobUrl} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-md text-slate-500 hover:text-brand-400 hover:bg-brand-400/10 transition-colors" title="Job posting">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )}
                  <Link to={`/jobs/${job._id}/edit`}
                    className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-surface-border transition-colors" title="Edit">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </Link>
                  <button onClick={() => setDeleteTarget(job)}
                    className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete application"
          message={`Remove ${deleteTarget.position} at ${deleteTarget.company}? This can't be undone.`}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading}
        />
      )}
    </div>
  );
}