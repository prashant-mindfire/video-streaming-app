import { CheckCircle2, Clock, Loader2, XCircle, X } from 'lucide-react';
import type { UploadQueueItem } from '@/types/upload';
import { ProcessingProgress } from '../videos/ProcessingProgress';

interface UploadItemProps {
  upload: UploadQueueItem;
  onRemove: (id: string) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';

  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
};

const statusConfig = {
  queued: {
    label: 'Queued',
    className: 'text-gray-600',
  },
  uploading: {
    label: 'Uploading',
    className: 'text-blue-600',
  },
  uploaded: {
    label: 'Uploaded',
    className: 'text-green-600',
  },
  failed: {
    label: 'Upload failed',
    className: 'text-red-600',
  },
};

const UploadItem = ({ upload, onRemove }: UploadItemProps) => {
  const status = statusConfig[upload.status];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-800">{upload.file.name}</p>

          <p className="mt-1 text-xs text-gray-500">{formatFileSize(upload.file.size)}</p>
        </div>

        <div className="flex items-center gap-2">
          {upload.status === 'queued' && <Clock className="h-4 w-4 text-gray-400" />}

          {upload.status === 'uploading' && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          )}

          {upload.status === 'uploaded' && <CheckCircle2 className="h-4 w-4 text-green-600" />}

          {upload.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}

          <span className={`text-xs font-medium ${status.className}`}>{status.label}</span>

          {upload.status !== 'uploading' && (
            <button
              type="button"
              onClick={() => onRemove(upload.id)}
              aria-label={`Remove ${upload.file.name}`}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {upload.status === 'uploading' && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>Uploading to storage</span>
            <span>{upload.progress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-200"
              style={{ width: `${upload.progress}%` }}
            />
          </div>
        </div>
      )}

      {upload.status === 'uploaded' && upload.videoId && (
        <ProcessingProgress videoId={upload.videoId} />
      )}

      {upload.status === 'failed' && upload.error && (
        <p className="mt-2 text-xs text-red-600">{upload.error}</p>
      )}
    </div>
  );
};

export default UploadItem;
