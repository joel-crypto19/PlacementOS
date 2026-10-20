import api from './api';

export const adminService = {
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (id, status, note = '') => {
    const response = await api.patch(`/admin/users/${id}/status`, { status, note });
    return response.data;
  },

  updateCompanyVerification: async (id, verificationStatus) => {
    const response = await api.patch(`/admin/companies/${id}/verification`, { verificationStatus });
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },

  // Data sync
  getDataSources: async () => {
    const response = await api.get('/sync/sources');
    return response.data;
  },

  triggerSync: async (providerKey) => {
    const response = await api.post(`/sync/trigger/${providerKey}`);
    return response.data;
  },

  getSyncLogs: async (params = {}) => {
    const response = await api.get('/sync/logs', { params });
    return response.data;
  },

  // Export CSV helpers
  exportApplicationsUrl: '/api/admin/export/applications',
  exportStudentsUrl: '/api/admin/export/students'
};
