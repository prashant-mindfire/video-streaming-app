import UploadItem from './UploadItem';
import type { UploadQueueItem } from '@/types/upload';

interface UploadQueueProps {
  uploads: UploadQueueItem[];
  onRemove: (id: string) => void;
  // onClearCompleted: () => void;
}

const UploadQueue = ({
  uploads,
  onRemove,
  // onClearCompleted,
}: UploadQueueProps) => {
  if (uploads.length === 0) return null;

  // const uploadedCount = uploads.filter(
  //   (item) => item.status === "uploaded"
  // ).length;

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Upload Queue ({uploads.length})</h3>

        {/* {uploadedCount > 0 && (
          <button
            type="button"
            onClick={onClearCompleted}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Clear uploaded
          </button>
        )} */}
      </div>

      <div className="space-y-3">
        {uploads.map((upload) => (
          <UploadItem key={upload.id} upload={upload} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};

export default UploadQueue;
