import Constants from 'expo-constants';

export const ENV = {
  // Configured default port matching the backend port we set earlier (2000)
  API_URL: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:2000/api/v1',
  TIMEOUT: 15000,
};

export default ENV;
