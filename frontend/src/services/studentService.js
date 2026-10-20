import api from './api';

export const studentService = {
  getProfile: async () => {
    const response = await api.get('/students/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/students/profile', profileData);
    return response.data;
  },

  uploadResume: async (formData) => {
    const response = await api.post('/students/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/students/dashboard');
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  }
};
