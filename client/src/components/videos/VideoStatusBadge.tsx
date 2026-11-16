import type { VideoStatus } from '@/types/video';
import { Badge } from '../common/Badge';

interface VideoStatusBadgeProps {
  status: VideoStatus;
}

const statusConfig: Record<
  VideoStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }
> = {
  uploaded: { label: 'Uploaded', variant: 'info' },
  queued: { label: 'Queued', variant: 'warning' },
  processing: { label: 'Processing', variant: 'warning' },
  ready: { label: 'Ready', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
};

export const VideoStatusBadge = ({ status }: VideoStatusBadgeProps) => {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
};
