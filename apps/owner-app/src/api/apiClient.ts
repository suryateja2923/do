import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '@/config/env';
import { TokenManager } from './TokenManager';

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: ENV.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
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

// Response Interceptor: Format output and handle 401 Session expirations
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    if (status === 401) {
      TokenManager.clearSession();
      // In React Native, routing triggers are usually bound to navigators.
      // We will handle session redirects in the auth store/layout triggers.
    }

    return Promise.reject(new Error(serverMessage || error.message || 'API request failed'));
  }
);

export default apiClient;
