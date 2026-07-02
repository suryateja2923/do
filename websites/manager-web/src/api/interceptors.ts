import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { TokenManager } from '@/features/authentication/utils/tokenManager';
import { mapAxiosError } from './errorMapper';

export const setupInterceptors = (axiosInstance: AxiosInstance): void => {
  // 1. Request Interceptor: Inject JWT token dynamically
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = TokenManager.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 2. Response Interceptor: Format errors and handle status redirections
  axiosInstance.interceptors.response.use(
    (response) => {
      // Unpack axios payload
      return response.data;
    },
    async (error: AxiosError) => {
      if (error.response) {
        const { status } = error.response;

        // Catch 401 Unauthorized -> Clear session and redirect to session expired route
        if (status === 401) {
          TokenManager.clearSession();
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.replace('/session-expired');
          }
        }

        // Catch 403 Forbidden -> Redirect to 403 route
        if (status === 403) {
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/403')) {
            window.location.replace('/403');
          }
        }
      }

      // Convert raw Axios error to UserFriendlyError format
      const mapped = mapAxiosError(error);
      return Promise.reject(new Error(mapped.message));
    }
  );
};

export default setupInterceptors;
