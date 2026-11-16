import type { DashboardOverview } from '@/types/dashboard';

interface ProcessingOverviewProps {
  videos: DashboardOverview['videos'];
  processingJobs: DashboardOverview['processingJobs'];
}

interface StatusBreakdownProps {
  title: string;
  statuses: Array<{
    label: string;
    count: number;
    color: string;
  }>;
}

const StatusBreakdown = ({ title, statuses }: StatusBreakdownProps) => {
  const total = statuses.reduce((sum, status) => sum + status.count, 0);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <span className="text-sm text-gray-500">{total.toLocaleString()} total</span>
      </div>

      <div className="space-y-4">
        {statuses.map((status) => {
          const percentage = total > 0 ? (status.count / total) * 100 : 0;

          return (
            <div key={status.label}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-600">{status.label}</span>
                <span className="font-medium text-gray-900">{status.count.toLocaleString()}</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${status.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const ProcessingOverview = ({ videos, processingJobs }: ProcessingOverviewProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-gray-900">Processing Overview</h2>
      <p className="mt-1 text-sm text-gray-500">Current video and processing job status</p>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <StatusBreakdown
          title="Videos"
          statuses={[
            { label: 'Ready', count: videos.ready, color: 'bg-green-500' },
            {
              label: 'Processing',
              count: videos.processing,
              color: 'bg-blue-500',
            },
            { label: 'Failed', count: videos.failed, color: 'bg-red-500' },
          ]}
        />
        <StatusBreakdown
          title="Processing jobs"
          statuses={[
            { label: 'Queued', count: processingJobs.queued, color: 'bg-yellow-500' },
            {
              label: 'Running',
              count: processingJobs.running,
              color: 'bg-blue-500',
            },
            {
              label: 'Failed',
              count: processingJobs.failed,
              color: 'bg-red-500',
            },
          ]}
        />
      </div>
    </div>
  );
};
