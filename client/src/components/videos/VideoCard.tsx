import type { Video } from '@/types/video';
import { Download, Play, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { ProcessingProgress } from './ProcessingProgress';
import { VideoStatusBadge } from './VideoStatusBadge';

interface VideoCardProps {
  video: Video;
  onDelete: (video: Video) => void;
  onPlay: (video: Video) => void;
  onDownload: (video: Video) => void;
  isDownloading?: boolean;
}

const formatFileSize = (bytes: number) => {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDuration = (seconds?: number) => {
  if (seconds == null) return '--:--';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const VideoCard = ({
  video,
  onDelete,
  onPlay,
  onDownload,
  isDownloading,
}: VideoCardProps) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="group relative aspect-video overflow-hidden bg-gray-100">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-600">
            No thumbnail available
          </div>
        )}

        {video.status === 'ready' && (
          <button
            type="button"
            onClick={() => onPlay(video)}
            aria-label={`Play ${video.title}`}
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-lg transition-transform duration-200 hover:scale-110">
              <Play size={20} className="ml-1 fill-current" />
            </div>
          </button>
        )}

        {video.durationSeconds != null && (
          <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
            {formatDuration(video.durationSeconds)}
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-gray-900">{video.title}</h3>

          <VideoStatusBadge status={video.status} />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatFileSize(video.fileSize)}</span>
          <span>
            {video.width && video.height ? `${video.width}x${video.height}` : 'Resolution pending'}
          </span>
        </div>

        {video.status === 'processing' && <ProcessingProgress videoId={video.id} />}

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-xs text-gray-500">
            {new Date(video.createdAt).toLocaleDateString()}
          </span>

          <div className="flex gap-2">
            {video.status === 'ready' && (
              <Button
                variant="outline"
                onClick={() => onDownload(video)}
                title="Download"
                aria-label={`Download ${video.title}`}
                loading={isDownloading}
              >
                <Download size={16} color="blue" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(video)}
              aria-label={`Delete ${video.title}`}
              title="delete"
            >
              <Trash2 size={16} color="red" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
