import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobsApi } from '../api';
import JobForm from '../components/common/JobForm';
import Toast from '../components/common/Toast';

export default function AddJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (form) => {
    setLoading(true);
    try {
      await jobsApi.create(form);
      navigate('/jobs', { state: { toast: { type: 'success', message: 'Application added!' } } });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to add application' });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <Toast {...toast} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/jobs" className="hover:text-slate-300 transition-colors">Applications</Link>
        <span>/</span>
        <span className="text-slate-300">Add New</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Add Application</h1>
        <p className="text-slate-400 text-sm mt-1">Track a new job you've applied to or plan to apply to</p>
      </div>

      <div className="card p-6">
        <JobForm onSubmit={handleSubmit} loading={loading} submitLabel="Add Application" />
      </div>
    </div>
  );
}
