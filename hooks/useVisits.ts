import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { visitService, Visit } from '@/services/visitService';

export const useVisits = () => {
  const queryClient = useQueryClient();

  const { data: visits, isLoading, error, refetch } = useQuery({
    queryKey: ['visits'],
    queryFn: async () => {
      const response = await visitService.getVisits();
      return response.data as Visit[];
    },
  });

  const createVisitMutation = useMutation({
    mutationFn: (formData: FormData) => visitService.createVisit(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent_visits'] });
    },
  });

  const updateVisitMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string | number; formData: FormData }) => 
      visitService.updateVisit(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });

  const deleteVisitMutation = useMutation({
    mutationFn: (id: string | number) => visitService.deleteVisit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent_visits'] });
    },
  });

  return {
    visits,
    isLoading,
    error,
    refetch,
    createVisit: createVisitMutation.mutateAsync,
    isCreating: createVisitMutation.isPending,
    updateVisit: updateVisitMutation.mutateAsync,
    isUpdating: updateVisitMutation.isPending,
    deleteVisit: deleteVisitMutation.mutateAsync,
    isDeleting: deleteVisitMutation.isPending,
  };
};

export const useRecentVisitsList = () => {
  return useQuery({
    queryKey: ['visits', 'recent'],
    queryFn: () => visitService.getRecent(),
  });
};
