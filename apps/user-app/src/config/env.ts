import Constants from 'expo-constants';

export const ENV = {
  API_URL: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:2000/api/v1',
  TIMEOUT: 15000,
};

export default ENV;
