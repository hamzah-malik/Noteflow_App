import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// Access token lives only in memory (Zustand), never localStorage.
// Refresh token is an httpOnly cookie the browser sends automatically.
export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// These endpoints are public and must never carry a stale Authorization
// header, and a 401 from them means "bad credentials" or "no/expired
// refresh cookie" - not "access token expired" - so they must never trigger
// the refresh-and-retry logic either. Skipping both was the actual bug:
// a leftover token on a login/register call was getting rejected by JWT
// auth before Django even reached the AllowAny permission check.
const PUBLIC_AUTH_PATHS = ['/auth/login/', '/auth/register/', '/auth/refresh/', '/auth/password-reset/', '/auth/password-reset/confirm/'];
const isPublicAuthRequest = (url) => PUBLIC_AUTH_PATHS.some((path) => url?.includes(path));

apiClient.interceptors.request.use((config) => {
  if (isPublicAuthRequest(config.url)) return config;
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicAuthRequest(originalRequest.url)) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post('/api/auth/refresh/', {}, { withCredentials: true })
            .finally(() => { refreshPromise = null; });
        }
        const { data } = await refreshPromise;
        useAuthStore.getState().setAccessToken(data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
