import { useQuery } from '@tanstack/react-query';
import { catalogService } from '@/services/catalogService';

export const useCatalogServices = () => {
  return useQuery({
    queryKey: ['catalog_services'],
    queryFn: () => catalogService.getServices(),
  });
};

export const useCatalogTags = () => {
  return useQuery({
    queryKey: ['catalog_tags'],
    queryFn: () => catalogService.getTags(),
  });
};

export const usePopularServices = () => {
  return useQuery({
    queryKey: ['popular_services'],
    queryFn: () => catalogService.getPopularServices(),
  });
};
