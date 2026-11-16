import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ProcessingOverview } from '@/components/dashboard/ProcessingOverview';
import type { DashboardOverview } from '@/types/dashboard';

const overview: DashboardOverview = {
  videos: { total: 3, ready: 3, processing: 0, failed: 0 },
  uploads: { total: 6 },
  processingJobs: { queued: 0, running: 0, failed: 0 },
  storage: { totalBytes: 93_924_908 },
  engagement: { totalViews: 0, totalDownloads: 0 },
  averageProcessingTimeSeconds: 1482.07,
};

describe('dashboard components', () => {
  it('renders metrics from the dashboard overview response', () => {
    render(<DashboardStats overview={overview} />);

    expect(screen.getByText('Total Videos')).toBeInTheDocument();
    expect(screen.getByText('Total Uploads')).toBeInTheDocument();
    expect(screen.getByText('Storage Used')).toBeInTheDocument();
    expect(screen.getByText('89.57 MB')).toBeInTheDocument();
    expect(screen.getByText('Total Views')).toBeInTheDocument();
    expect(screen.getByText('Total Downloads')).toBeInTheDocument();
    expect(screen.getByText('Avg. Processing Time')).toBeInTheDocument();
    expect(screen.getByText('24m 42s')).toBeInTheDocument();
  });

  it('shows video and processing-job counts, including empty states', () => {
    render(
      <ProcessingOverview
        videos={overview.videos}
        processingJobs={overview.processingJobs}
      />,
    );

    expect(screen.getByText('Videos')).toBeInTheDocument();
    expect(screen.getByText('3 total')).toBeInTheDocument();
    expect(screen.getByText('Processing jobs')).toBeInTheDocument();
    expect(screen.getByText('0 total')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('Queued')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
  });
});
