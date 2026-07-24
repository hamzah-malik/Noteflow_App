import { apiClient } from './client';

export const listNotifications = () => apiClient.get('/notifications/');
export const markNotificationRead = (id) => apiClient.post(`/notifications/${id}/mark_read/`);
export const markAllNotificationsRead = () => apiClient.post('/notifications/mark_all_read/');
