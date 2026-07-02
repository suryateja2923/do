import { apiClient } from './axios';
import { setupInterceptors } from './interceptors';

// Bind authorization and error filters
setupInterceptors(apiClient);

export { apiClient };
export default apiClient;
