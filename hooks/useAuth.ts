import { authService } from '@/services/authService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = await authService.getAuthToken();
      if (token) {
        try {
          const response = await authService.getUser();
          return response.data; // Assuming response follows { success, message, data: user }
        } catch (error) {
          console.error('Failed to hydrate user:', error);
          await authService.logout(); // Clear invalid token
          return null;
        }
      }
      return null;
    },
    staleTime: Infinity, // Keep user data until logout or manual invalidation
  });

  const login = async (userData: any, token: string) => {
    await authService.saveToken(token);
    queryClient.setQueryData(['user'], userData);
  };

  const logout = async () => {
    await authService.logout();
    queryClient.setQueryData(['user'], null);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
