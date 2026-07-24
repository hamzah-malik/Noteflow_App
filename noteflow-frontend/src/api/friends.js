import { apiClient } from './client';

export const listFriends = () => apiClient.get('/friends/');
export const listFriendsNotesSummary = () => apiClient.get('/friends/notes-summary/');
export const getFriendProfile = (userId) => apiClient.get(`/friends/${userId}/profile/`);
export const listFriendRequests = (direction) =>
  apiClient.get('/friend-requests/', { params: { direction } });
export const sendFriendRequest = (toUserId) => apiClient.post('/friend-requests/', { to_user: toUserId });
export const acceptFriendRequest = (id) => apiClient.post(`/friend-requests/${id}/accept/`);
export const rejectFriendRequest = (id) => apiClient.post(`/friend-requests/${id}/reject/`);
export const removeFriend = (id) => apiClient.delete(`/friend-requests/${id}/`);
