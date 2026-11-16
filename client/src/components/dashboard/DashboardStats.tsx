import { Video, Upload, HardDrive, Eye, Download, Clock3 } from 'lucide-react';
import { formatFileSize } from '../../utils/formatFileSize';
import { StatCard } from './StatCard';
import type { DashboardOverview } from '@/types/dashboard';

interface DashboardStatsProps {
  overview: DashboardOverview;
}

const formatProcessingTime = (seconds: number) => {
  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
};

export const DashboardStats = ({ overview }: DashboardStatsProps) => {
  const stats = [
    {
      title: 'Total Videos',
      value: overview.videos.total.toLocaleString(),
      description: `${overview.videos.ready.toLocaleString()} ready`,
      icon: Video,
    },
    {
      title: 'Total Uploads',
      value: overview.uploads.total.toLocaleString(),
      description: 'Uploads started on the platform',
      icon: Upload,
    },
    {
      title: 'Storage Used',
      value: formatFileSize(overview.storage.totalBytes),
      description: 'Original and processed video files',
      icon: HardDrive,
    },
    {
      title: 'Total Views',
      value: overview.engagement.totalViews.toLocaleString(),
      description: 'Total video playback views',
      icon: Eye,
    },
    {
      title: 'Total Downloads',
      value: overview.engagement.totalDownloads.toLocaleString(),
      description: 'Original video downloads',
      icon: Download,
    },
    {
      title: 'Avg. Processing Time',
      value: formatProcessingTime(overview.averageProcessingTimeSeconds),
      description: 'Average time per video',
      icon: Clock3,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};
