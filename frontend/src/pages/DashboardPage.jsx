import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import Spinner from '../components/common/Spinner';
import { formatDate } from '../utils/constants';

const StatCard = ({ label, value, color, icon }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">{label}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.getAll({ limit: 5 })
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Spinner size="lg" className="text-brand-500" />
    </div>
  );

  const stats = data?.stats || {};
  const recent = data?.jobs || [];

  const statCards = [
    {
      label: 'Total',
      value: stats.total || 0,
      color: 'bg-slate-700/60',
      icon: <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      label: 'Applied',
      value: stats.Applied || 0,
      color: 'bg-blue-500/10',
      icon: <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    },
    {
      label: 'Interview',
      value: stats.Interview || 0,
      color: 'bg-amber-500/10',
      icon: <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    },
    {
      label: 'Accepted',
      value: stats.Accepted || 0,
      color: 'bg-emerald-500/10',
      icon: <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: 'Rejected',
      value: stats.Rejected || 0,
      color: 'bg-red-500/10',
      icon: <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here's your job search overview</p>
        </div>
        <Link to="/jobs/new" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Job
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(card => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-300">Pipeline Overview</h2>
            <span className="text-xs text-slate-500">{stats.total} total</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            {['Applied', 'Interview', 'Accepted', 'Rejected'].map(s => {
              const pct = ((stats[s] || 0) / stats.total) * 100;
              const colors = { Applied: 'bg-blue-500', Interview: 'bg-amber-500', Accepted: 'bg-emerald-500', Rejected: 'bg-red-500' };
              return pct > 0 ? (
                <div key={s} className={`${colors[s]} rounded-full transition-all`} style={{ width: `${pct}%` }} title={`${s}: ${stats[s]}`} />
              ) : null;
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {['Applied', 'Interview', 'Accepted', 'Rejected'].map(s => {
              const dotColors = { Applied: 'bg-blue-500', Interview: 'bg-amber-500', Accepted: 'bg-emerald-500', Rejected: 'bg-red-500' };
              return (
                <div key={s} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${dotColors[s]}`} />
                  {s} ({stats[s] || 0})
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Recent Applications</h2>
          <Link to="/jobs" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            View all 
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm mb-4">No applications yet</p>
            <Link to="/jobs/new" className="btn-primary inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add your first job
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="divide-y divide-surface-border">
              {recent.map(job => (
                <Link key={job._id} to={`/jobs/${job._id}/edit`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface-muted/50 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center flex-shrink-0 text-sm font-semibold text-slate-300 group-hover:bg-brand-600/20 group-hover:text-brand-300 transition-colors">
                    {job.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{job.position}</p>
                    <p className="text-xs text-slate-500 truncate">{job.company} � {job.location}</p>
                  </div>
                  <StatusBadge status={job.status} />
                  <span className="text-xs text-slate-600 hidden sm:block flex-shrink-0">{formatDate(job.appliedDate)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
