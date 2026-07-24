import { apiClient } from './client';

export const register = (payload) => apiClient.post('/auth/register/', payload);
export const login = (email, password, rememberMe) =>
  apiClient.post('/auth/login/', { email, password, remember_me: rememberMe });
export const logout = () => apiClient.post('/auth/logout/');
export const requestPasswordReset = (email) => apiClient.post('/auth/password-reset/', { email });
export const confirmPasswordReset = (uid, token, newPassword) =>
  apiClient.post('/auth/password-reset/confirm/', { uid, token, new_password: newPassword });
export const fetchMe = () => apiClient.get('/users/me/');
export const changePassword = (oldPassword, newPassword) =>
  apiClient.post('/auth/change-password/', { old_password: oldPassword, new_password: newPassword });
export const searchUsers = (q) => apiClient.get('/users/search/', { params: { q } });
