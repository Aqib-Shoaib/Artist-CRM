import api from './api';

export const photoService = {
  getVisitPhotos: async (visitId: string | number) => {
    try {
      const response = await api.get(`/api/v1/visits/${visitId}/photos`);
      return response.data;
    } catch (error) {
      console.error(`Fetch Photos for Visit ${visitId} Error:`, error);
      throw error;
    }
  },

  uploadPhotos: async (visitId: string | number, formData: FormData) => {
    try {
      const response = await api.post(`/api/v1/visits/${visitId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Upload Photos for Visit ${visitId} Error:`, error);
      throw error;
    }
  },

  deletePhoto: async (photoId: string | number) => {
    try {
      const response = await api.delete(`/api/v1/photos/${photoId}`);
      return response.data;
    } catch (error) {
      console.error(`Delete Photo ${photoId} Error:`, error);
      throw error;
    }
  }
};
