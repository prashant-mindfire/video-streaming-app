import { RefreshCw } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { DashboardStats, ProcessingOverview } from '../../components/dashboard';
import { useDashboard } from '../../hooks/useDashboard';

const Dashboard = () => {
  const { data, isLoading, isFetching, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">Unable to load dashboard data.</p>

        <Button className="mt-4" variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor video uploads, processing and platform activity.
          </p>
        </div>

        <Button variant="outline" onClick={() => refetch()} loading={isFetching}>
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      <DashboardStats overview={data} />

      <ProcessingOverview videos={data.videos} processingJobs={data.processingJobs} />
    </div>
  );
};

export default Dashboard;
