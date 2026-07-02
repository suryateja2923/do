import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

export const setupRetryHandler = (
  axiosInstance: AxiosInstance,
  maxRetries: number = 2
): void => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

      if (!config) return Promise.reject(error);

      // Retry only on network timeouts/abort failures
      const shouldRetry = error.code === 'ECONNABORTED' || !error.response;

      if (shouldRetry) {
        config._retryCount = config._retryCount ?? 0;

        if (config._retryCount < maxRetries) {
          config._retryCount += 1;
          console.warn(`[API Client] Retrying request (${config._retryCount}/${maxRetries}) for URL: ${config.url}`);
          return axiosInstance(config);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default setupRetryHandler;
