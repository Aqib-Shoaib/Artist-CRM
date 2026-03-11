import api from './api';

export const catalogService = {
  getServices: async () => {
    try {
      const response = await api.get('/api/v1/services');
      return response.data;
    } catch (error) {
      console.error("Fetch Services Error:", error);
      throw error;
    }
  },

  getPopularServices: async () => {
    try {
      const response = await api.get('/api/v1/services/popular');
      return response.data;
    } catch (error) {
      console.error("Popular Services Error:", error);
      throw error;
    }
  },

  getTags: async () => {
    try {
      const response = await api.get('/api/v1/tags');
      return response.data;
    } catch (error) {
      console.error("Fetch Tags Error:", error);
      throw error;
    }
  },

  getPopularTags: async () => {
    try {
      const response = await api.get('/api/v1/tags/popular');
      return response.data;
    } catch (error) {
      console.error("Popular Tags Error:", error);
      throw error;
    }
  }
};
