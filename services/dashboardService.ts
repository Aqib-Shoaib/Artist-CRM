import api from './api';

export const dashboardService = {
  getOverview: async () => {
    try {
      const response = await api.get('/api/v1/dashboard/overview');
      return response.data;
    } catch (error) {
      console.error("Dashboard Overview Error:", error);
      throw error;
    }
  },

  getRecentVisits: async () => {
    try {
      const response = await api.get('/api/v1/dashboard/recent-visits');
      return response.data;
    } catch (error) {
      console.error("Dashboard Recent Visits Error:", error);
      throw error;
    }
  },

  getTopClients: async (sortBy: string = 'revenue') => {
    try {
      const response = await api.get(`/api/v1/dashboard/top-clients?sort_by=${sortBy}`);
      return response.data;
    } catch (error) {
      console.error("Dashboard Top Clients Error:", error);
      throw error;
    }
  },

  getRevenueSummary: async () => {
    try {
      const response = await api.get('/api/v1/dashboard/revenue-summary');
      return response.data;
    } catch (error) {
      console.error("Dashboard Revenue Summary Error:", error);
      throw error;
    }
  },

  getServicePerformance: async () => {
    try {
      const response = await api.get('/api/v1/dashboard/service-performance');
      return response.data;
    } catch (error) {
      console.error("Dashboard Service Performance Error:", error);
      throw error;
    }
  },

  getUpcomingVisits: async () => {
    try {
      const response = await api.get('/api/v1/dashboard/upcoming-visits');
      return response.data;
    } catch (error) {
      console.error("Dashboard Upcoming Visits Error:", error);
      throw error;
    }
  },

  getQuickStats: async () => {
    try {
      const response = await api.get('/api/v1/dashboard/quick-stats');
      return response.data;
    } catch (error) {
      console.error("Dashboard Quick Stats Error:", error);
      throw error;
    }
  }
};
