import { VideoCard } from './VideoCard';
import { EmptyState } from '../common/EmptyState';
import type { Video } from '@/types/video';

interface VideoGridProps {
  videos: Video[];
  onDelete: (video: Video) => void;
  onPlay: (video: Video) => void;
  onDownload: (video: Video) => void;
  isDownloading?: boolean;
}

export const VideoGrid = ({
  videos,
  onDelete,
  onPlay,
  onDownload,
  isDownloading,
}: VideoGridProps) => {
  if (!videos.length) {
    return (
      <EmptyState
        title="No videos found"
        description="Upload a video or try changing your search filters."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onDelete={onDelete}
          onPlay={onPlay}
          onDownload={onDownload}
          isDownloading={isDownloading}
        />
      ))}
    </div>
  );
};
