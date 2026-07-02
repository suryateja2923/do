import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { TokenManager } from '../features/authentication/utils/tokenManager';

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

  // 2. Response Interceptor: Format error layouts and catch status codes
  axiosInstance.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
      
      // Auto-retry strategy for network failures or 503 timeouts (up to 2 times)
      if (error.code === 'ECONNABORTED' || !error.response) {
        originalRequest._retryCount = originalRequest._retryCount || 0;
        if (originalRequest._retryCount < 2) {
          originalRequest._retryCount += 1;
          return axiosInstance(originalRequest);
        }
      }

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
          if (typeof window !== 'undefined') {
            window.location.replace('/403');
          }
        }
      }

      // Standardize Axios error formats
      const serverMessage = (error.response?.data as any)?.message || error.message || 'An error occurred';
      return Promise.reject(new Error(serverMessage));
    }
  );
};

export default setupInterceptors;
