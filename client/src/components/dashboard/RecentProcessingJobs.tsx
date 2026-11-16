import { RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/formatDate';
import type { RecentProcessingJob } from '@/types/dashboard';

interface RecentProcessingJobsProps {
  jobs: RecentProcessingJob[];
  retryingJobId?: string;
  onRetry: (jobId: string) => void;
}

const statusStyles: Record<string, string> = {
  queued: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  dead_lettered: 'bg-red-100 text-red-700',
};

export const RecentProcessingJobs = ({
  jobs,
  retryingJobId,
  onRetry,
}: RecentProcessingJobsProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900">Recent Processing Jobs</h2>

        <p className="mt-1 text-sm text-gray-500">Latest video processing activity</p>
      </div>

      {jobs.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">No processing jobs found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-187.5 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Video</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3">Attempts</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {jobs.map((job) => {
                const canRetry = job.status === 'failed' || job.status === 'dead_lettered';

                return (
                  <tr key={job.id}>
                    <td className="px-5 py-4 font-medium text-gray-900">{job.videoTitle}</td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusStyles[job.status] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${Math.min(Math.max(job.progress, 0), 100)}%`,
                            }}
                          />
                        </div>

                        <span className="text-xs text-gray-500">{job.progress}%</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-600">{job.attempts}</td>

                    <td className="px-5 py-4 text-gray-500">{formatDate(job.createdAt)}</td>

                    <td className="px-5 py-4">
                      {canRetry && (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={retryingJobId === job.id}
                          disabled={Boolean(retryingJobId)}
                          onClick={() => onRetry(job.id)}
                        >
                          <RefreshCw size={14} />
                          Retry
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
