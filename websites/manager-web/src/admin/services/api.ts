import { apiClient } from '../api/apiClient';

// Maintain backward compatibility by exporting the upgraded client under old reference name
export const api = apiClient;
export default api;
