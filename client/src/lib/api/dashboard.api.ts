import type { DashboardOverview } from '@/types/dashboard';
import { http } from '../http';

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const { data } = await http.get('/admin/dashboard/overview');
  return data.data;
};

export const retryProcessingJob = async (jobId: string): Promise<void> => {
  await http.post(`/processing-jobs/${jobId}/retries`);
};
