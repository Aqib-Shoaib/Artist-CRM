import api from './api';

export interface Client {
  id: string | number;
  name: string;
  phone: string;
  email?: string;
  instagram?: string;
  general_notes?: string;
  profile_image?: any;
  created_at?: string;
}

export const clientService = {
  getClients: async () => {
    try {
      const response = await api.get('/api/v1/clients');
      return response.data;
    } catch (error) {
      console.error("Fetch Clients Error:", error);
      throw error;
    }
  },

  getClientDetails: async (id: string | number) => {
    try {
      const response = await api.get(`/api/v1/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fetch Client ${id} Error:`, error);
      throw error;
    }
  },

  createClient: async (formData: FormData) => {
    try {
      const response = await api.post('/api/v1/clients', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Create Client Error:", error);
      throw error;
    }
  },

  updateClient: async (id: string | number, formData: FormData) => {
    try {
      // Laravel often requires POST with _method=PUT for multipart/form-data
      formData.append('_method', 'PUT');
      const response = await api.post(`/api/v1/clients/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Update Client ${id} Error:`, error);
      throw error;
    }
  },

  deleteClient: async (id: string | number) => {
    try {
      const response = await api.delete(`/api/v1/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete Client ${id} Error:`, error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/api/v1/clients/stats');
      return response.data;
    } catch (error) {
      console.error("Client Stats Error:", error);
      throw error;
    }
  }
};
