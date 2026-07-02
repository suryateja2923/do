export const AUTH_CONFIG = {
  TOKEN_STORAGE_KEY: 'homiepg_auth_token',
  USER_STORAGE_KEY: 'homiepg_auth_user',
  // Inactivity timeout configuration
  INACTIVITY_TIMEOUT_MS: 15 * 60 * 1000, // 15 Minutes
  WARNING_TIMEOUT_MS: 60 * 1000, // Show warning 60 seconds before logout
};

export default AUTH_CONFIG;
