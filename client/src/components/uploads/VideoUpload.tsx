import useVideoUpload from '@/hooks/useVideoUpload';
import FileDropzone from './FileDropzone';
import UploadQueue from './UploadQueue';

interface VideoUploadProps {
  onUploadComplete?: (videoIds: string[]) => void;
}

const VideoUpload = ({ onUploadComplete }: VideoUploadProps) => {
  const { uploads, isUploading, addFiles, startUploads, removeQueuedItem } = useVideoUpload();

  const queuedCount = uploads.filter((item) => item.status === 'queued').length;

  const handleStartUploads = async () => {
    const videoIds = await startUploads();

    if (videoIds.length > 0) {
      onUploadComplete?.(videoIds);
    }
  };

  return (
    <div>
      <FileDropzone onFilesSelected={addFiles} disabled={isUploading} />

      <UploadQueue uploads={uploads} onRemove={removeQueuedItem} />

      {queuedCount > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleStartUploads}
            disabled={isUploading}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading
              ? 'Uploading...'
              : `Upload ${queuedCount} video${queuedCount > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
