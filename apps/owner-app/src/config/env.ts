import Constants from 'expo-constants';

const API_URL: string = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:2000/api/v1';

export const ENV = {
  // Configured default port matching the backend port we set earlier (2000)
  API_URL,
  // Socket.IO attaches to the raw HTTP server, not under the /api/v1 REST prefix
  SOCKET_URL: API_URL.replace(/\/api\/v1\/?$/, ''),
  TIMEOUT: 15000,
};

export default ENV;
