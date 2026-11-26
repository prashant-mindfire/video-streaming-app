import type { UploadQueueItem } from '@/types/upload';
import { UploadItem } from './UploadItem';

interface UploadQueueProps {
  uploads: UploadQueueItem[];
  onRemove?: (id: string) => void;
}

const UploadQueue = ({ uploads }: UploadQueueProps) => {
  if (uploads.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Upload Queue ({uploads.length})</h3>
      </div>

      <div className="space-y-3">
        {uploads.map((upload) => (
          <UploadItem key={upload.id} upload={upload} />
        ))}
      </div>
    </div>
  );
};

export default UploadQueue;
