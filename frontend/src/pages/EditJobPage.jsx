import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { jobsApi } from '../api';
import JobForm from '../components/common/JobForm';
import Toast from '../components/common/Toast';
import Spinner from '../components/common/Spinner';

export default function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    jobsApi.getOne(id)
      .then(({ data }) => setJob(data.job))
      .catch(() => navigate('/jobs'))
      .finally(() => setFetching(false));
  }, [id, navigate]);

  const handleSubmit = async (form) => {
    setLoading(true);
    try {
      await jobsApi.update(id, form);
      navigate('/jobs', { state: { toast: { type: 'success', message: 'Application updated!' } } });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to update application' });
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex justify-center py-20">
      <Spinner size="lg" className="text-brand-500" />
    </div>
  );

  return (
    <div className="max-w-2xl animate-fade-in">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <Toast {...toast} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/jobs" className="hover:text-slate-300 transition-colors">Applications</Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[200px]">{job?.position} at {job?.company}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Application</h1>
        <p className="text-slate-400 text-sm mt-1">Update the details for this application</p>
      </div>

      <div className="card p-6">
        {job && <JobForm initialData={job} onSubmit={handleSubmit} loading={loading} submitLabel="Save Changes" />}
      </div>
    </div>
  );
}
