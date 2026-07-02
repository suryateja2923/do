import { axiosInstance } from './axios';
import { setupInterceptors } from './interceptors';
import { setupRetryHandler } from './retryHandler';

// Bind authorization and error filters
setupInterceptors(axiosInstance);

// Bind network retry strategy
setupRetryHandler(axiosInstance);

export const apiClient = axiosInstance;
export default apiClient;
