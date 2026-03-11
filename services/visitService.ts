import api from './api';

export interface Visit {
  id: string | number;
  client_id: string | number;
  visit_date: string;
  visit_time: string;
  notes?: string;
  total_amount?: number | string;
  payment_status?: 'paid' | 'unpaid' | 'partial';
  photos?: { id: number; url: string }[];
  client?: {
    id: number;
    name: string;
    phone: string;
    profile_image?: string;
  };
  services?: any[];
  tags?: any[];
  created_at?: string;
}

export const visitService = {
  getVisits: async () => {
    try {
      const response = await api.get('/api/v1/visits?include=client,services,tags');
      return response.data;
    } catch (error) {
      console.error("Fetch Visits Error:", error);
      throw error;
    }
  },

  getVisitDetails: async (id: string | number) => {
    try {
      const response = await api.get(`/api/v1/visits/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fetch Visit ${id} Error:`, error);
      throw error;
    }
  },

  createVisit: async (formData: FormData) => {
    try {
      const response = await api.post('/api/v1/visits', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Create Visit Error:", error);
      throw error;
    }
  },

  updateVisit: async (id: string | number, formData: FormData) => {
    try {
      formData.append('_method', 'PUT');
      const response = await api.post(`/api/v1/visits/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Update Visit ${id} Error:`, error);
      throw error;
    }
  },

  deleteVisit: async (id: string | number) => {
    try {
      const response = await api.delete(`/api/v1/visits/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete Visit ${id} Error:`, error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/api/v1/visits/stats');
      return response.data;
    } catch (error) {
      console.error("Visit Stats Error:", error);
      throw error;
    }
  },

  getRecent: async () => {
    try {
      const response = await api.get('/api/v1/visits/recent');
      return response.data;
    } catch (error) {
      console.error("Recent Visits Error:", error);
      throw error;
    }
  }
};
