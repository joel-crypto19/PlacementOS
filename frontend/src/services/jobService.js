import api from './api';

export const jobService = {
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  getMyJobs: async () => {
    const response = await api.get('/jobs/my');
    return response.data;
  },

  // Saved jobs wishlist
  getSavedJobs: async () => {
    const response = await api.get('/saved-jobs');
    return response.data;
  },

  saveJob: async (jobId) => {
    const response = await api.post(`/saved-jobs/${jobId}`);
    return response.data;
  },

  unsaveJob: async (jobId) => {
    const response = await api.delete(`/saved-jobs/${jobId}`);
    return response.data;
  }
};
