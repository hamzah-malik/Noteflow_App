import { apiClient } from './client';

export const listAccessRequests = (direction) =>
  apiClient.get('/access-requests/', { params: { direction } });
export const createAccessRequest = (noteId, message) =>
  apiClient.post('/access-requests/', { note: noteId, message });
export const approveAccessRequest = (id) => apiClient.post(`/access-requests/${id}/approve/`);
export const rejectAccessRequest = (id) => apiClient.post(`/access-requests/${id}/reject/`);
