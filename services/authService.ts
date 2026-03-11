import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const authService = {
  login: async (data: any) => {
    try {
      const response = await api.post('/api/v1/auth/login', data);
      return response.data;
    } catch (error: any) {
      console.log("Backend Login Error:", error.response?.data);
      throw error;
    }
  },

  register: async (data: any) => {
    try {
      const response = await api.post('/api/v1/auth/register', data);
      return response.data;
    } catch (error: any) {
      console.log("Backend Register Error:", error.response?.data);
      throw error;
    }
  },

  getUser: async () => {
    try {
      const response = await api.get('/api/v1/user');
      return response.data;
    } catch (error: any) {
      console.log("Backend Get User Error:", error.response?.data);
      throw error;
    }
  },

  saveToken: async (token: string) => {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  },

  getAuthToken: async () => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  logout: async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (error: any) {
      console.log("Backend Logout Error:", error.response?.data || error.message);
    } finally {
      try {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem(USER_DATA_KEY);
      } catch (error) {
        console.error('Error clearing storage during logout:', error);
      }
    }
  },
};
