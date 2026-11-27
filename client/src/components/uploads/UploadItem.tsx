import { AccessibleProgress } from '@/components/common/AccessibleProgress';
import { ProcessingProgress } from '../videos/ProcessingProgress';
import type { UploadQueueItem } from '@/types/upload';

interface UploadItemProps {
  upload: UploadQueueItem;
}

export const UploadItem = ({ upload }: UploadItemProps) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">{upload.file.name}</p>

          <p className="mt-1 text-sm text-gray-600">
            {(upload.file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>

        <span className="shrink-0 text-sm font-medium text-gray-700">{upload.status}</span>
      </div>

      {upload.status === 'queued' && (
        <p role="status" className="text-sm text-gray-600">
          Waiting to upload.
        </p>
      )}

      {upload.status === 'uploading' && (
        <AccessibleProgress
          label={`Uploading ${upload.file.name}`}
          progress={upload.progress}
          status="uploading"
        />
      )}

      {upload.status === 'uploaded' && upload.videoId && (
        <>
          <p role="status" className="sr-only">
            Upload complete. Your video is queued for processing.
          </p>

          <ProcessingProgress videoId={upload.videoId} />
        </>
      )}

      {upload.status === 'failed' && (
        <AccessibleProgress
          label={`Upload ${upload.file.name}`}
          progress={upload.progress}
          status="failed"
          error={upload.error || 'The upload failed. Please try again.'}
        />
      )}
    </div>
  );
};
