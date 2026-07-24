import { apiClient } from './client';

export const listNotes = (params) => apiClient.get('/notes/', { params });
export const getNote = (id) => apiClient.get(`/notes/${id}/`);
export const deleteNote = (id) => apiClient.delete(`/notes/${id}/`);
export const uploadNote = (formData) =>
  apiClient.post('/notes/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getDownloadUrl = (id) => apiClient.get(`/notes/${id}/download/`);
export const getPreviewUrl = (id) => apiClient.get(`/notes/${id}/preview/`);
export const fetchDashboard = () => apiClient.get('/dashboard/');
