import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDashboardOverview, retryProcessingJob } from '../lib/api/dashboard.api';

export const dashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
};

export const useDashboard = () => {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: getDashboardOverview,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
};

export const useRetryProcessingJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryProcessingJob,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      });
    },
  });
};
