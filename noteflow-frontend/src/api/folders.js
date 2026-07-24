import { apiClient } from './client';

export const listFolders = (params) => apiClient.get('/folders/', { params });
export const createFolder = (payload) => apiClient.post('/folders/', payload);
export const updateFolder = (id, payload) => apiClient.patch(`/folders/${id}/`, payload);
export const deleteFolder = (id) => apiClient.delete(`/folders/${id}/`);
export const shareFolder = (id, visibility) => apiClient.post(`/folders/${id}/share/`, { visibility });
