import axios from 'axios';

const api = axios.create({
  baseURL: 'https://job-tracker-api-dic5.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 60000, // زيادة وقت الانتظار لـ 60 ثانية ليتمكن السيرفر من الاستيقاظ
});

// إعداد التوكن
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    
    if (!error.response && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
      if (!config._retryCount) config._retryCount = 0;

      if (config._retryCount < 3) { 
        config._retryCount += 1;
        console.log(`Connection failed, retrying... attempt ${config._retryCount}`);
        
        await new Promise(resolve => setTimeout(resolve, 2000 * config._retryCount));
        return api(config);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('jt_token');
      localStorage.removeItem('jt_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const jobsApi = {
  getAll: (params) => api.get('/jobs', { params }),
  getOne: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

export default api;

export const jobDetailsApi = {
  addNote: (jobId, data) => api.post(`/jobs/${jobId}/notes`, data),
  updateNote: (jobId, noteId, data) => api.put(`/jobs/${jobId}/notes/${noteId}`, data),
  deleteNote: (jobId, noteId) => api.delete(`/jobs/${jobId}/notes/${noteId}`),
  addQuestion: (jobId, data) => api.post(`/jobs/${jobId}/questions`, data),
  deleteQuestion: (jobId, idx) => api.delete(`/jobs/${jobId}/questions/${idx}`),
  addDocument: (jobId, data) => api.post(`/jobs/${jobId}/documents`, data),
  deleteDocument: (jobId, docId) => api.delete(`/jobs/${jobId}/documents/${docId}`),
};

export const analyticsApi = {
  get: () => api.get('/analytics'),
};