import { useState, useEffect } from 'react';

export default function JobForm({ initialData, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    salary: '',
    status: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company || '',
        position: initialData.position || '',
        location: initialData.location || '',
        salary: initialData.salary || '',
        status: initialData.status || 'Applied',
        appliedDate: initialData.appliedDate ? initialData.appliedDate.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl bg-slate-900 p-6 rounded-xl border border-slate-800">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Company Name</label>
        <input
          type="text"
          name="company"
          required
          value={formData.company}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-brand-500"
          placeholder="e.g. Google"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Position</label>
        <input
          type="text"
          name="position"
          required
          value={formData.position}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-brand-500"
          placeholder="e.g. Full-Stack Developer"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-brand-500"
            placeholder="e.g. Remote / Amman"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Salary</label>
          <input
            type="text"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-brand-500"
            placeholder="e.g. $1,200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-brand-500"
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
            <option value="Accepted">Accepted</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Applied Date</label>
          <input
            type="date"
            name="appliedDate"
            required
            value={formData.appliedDate}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors focus:outline-none"
      >
        {isLoading ? 'Saving...' : initialData ? 'Update Application' : 'Add Application'}
      </button>
    </form>
  );
}