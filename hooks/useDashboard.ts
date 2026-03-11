import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard_overview'],
    queryFn: () => dashboardService.getOverview(),
  });
};

export const useRecentVisits = () => {
  return useQuery({
    queryKey: ['recent_visits'],
    queryFn: () => dashboardService.getRecentVisits(),
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: () => dashboardService.getQuickStats(),
  });
};

export const useRevenueSummary = () => {
  return useQuery({
    queryKey: ['revenue_summary'],
    queryFn: () => dashboardService.getRevenueSummary(),
  });
};

export const useUpcomingVisits = () => {
  return useQuery({
    queryKey: ['upcoming_visits'],
    queryFn: () => dashboardService.getUpcomingVisits(),
  });
};
