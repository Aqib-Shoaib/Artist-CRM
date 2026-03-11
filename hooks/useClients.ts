import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientService, Client } from '@/services/clientService';

export const useClients = () => {
  const queryClient = useQueryClient();

  const { data: clients, isLoading, error, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await clientService.getClients();
      return response.data as Client[]; // Adjust based on actual API response structure
    },
  });

  const createClientMutation = useMutation({
    mutationFn: (formData: FormData) => clientService.createClient(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string | number; formData: FormData }) => 
      clientService.updateClient(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: string | number) => clientService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });

  return {
    clients,
    isLoading,
    error,
    refetch,
    createClient: createClientMutation.mutateAsync,
    isCreating: createClientMutation.isPending,
    updateClient: updateClientMutation.mutateAsync,
    isUpdating: updateClientMutation.isPending,
    deleteClient: deleteClientMutation.mutateAsync,
    isDeleting: deleteClientMutation.isPending,
  };
};

export const useClientStats = () => {
  return useQuery({
    queryKey: ['client_stats'],
    queryFn: () => clientService.getStats(),
  });
};
