import api from './api';

export const driveService = {
  getDrives: async (params = {}) => {
    const response = await api.get('/placement-drives', { params });
    return response.data;
  },

  getDriveById: async (id) => {
    const response = await api.get(`/placement-drives/${id}`);
    return response.data;
  },

  createDrive: async (data) => {
    const response = await api.post('/placement-drives', data);
    return response.data;
  },

  updateDrive: async (id, data) => {
    const response = await api.put(`/placement-drives/${id}`, data);
    return response.data;
  }
};

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }
};
