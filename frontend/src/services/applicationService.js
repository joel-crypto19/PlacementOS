import api from './api';

export const applicationService = {
  apply: async (jobId, customAnswers = {}, notes = '') => {
    const response = await api.post('/applications', { jobId, customAnswers, notes });
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/applications/me');
    return response.data;
  },

  getJobApplications: async (jobId, params = {}) => {
    const response = await api.get(`/applications/job/${jobId}`, { params });
    return response.data;
  },

  updateStatus: async (applicationId, status, note = '') => {
    const response = await api.patch(`/applications/${applicationId}/status`, { status, note });
    return response.data;
  },

  withdraw: async (applicationId) => {
    const response = await api.post(`/applications/${applicationId}/withdraw`);
    return response.data;
  },

  // Interviews
  scheduleInterview: async (interviewData) => {
    const response = await api.post('/interviews', interviewData);
    return response.data;
  },

  getMyInterviews: async () => {
    const response = await api.get('/interviews/my');
    return response.data;
  },

  updateInterview: async (id, updateData) => {
    const response = await api.patch(`/interviews/${id}`, updateData);
    return response.data;
  }
};
