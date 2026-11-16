import { HardDrive } from 'lucide-react';
import { formatFileSize } from '../../utils/formatFileSize';

interface StorageUsageProps {
  totalStorageBytes: number;
  totalVideos: number;
}

export const StorageUsage = ({ totalStorageBytes, totalVideos }: StorageUsageProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gray-100 p-2">
          <HardDrive size={20} className="text-gray-600" />
        </div>

        <div>
          <h2 className="font-semibold text-gray-900">Storage Usage</h2>

          <p className="text-sm text-gray-500">Platform storage consumption</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-3xl font-semibold text-gray-900">{formatFileSize(totalStorageBytes)}</p>

        <p className="mt-2 text-sm text-gray-500">
          Across {totalVideos.toLocaleString()} videos and their processed variants.
        </p>
      </div>
    </div>
  );
};
