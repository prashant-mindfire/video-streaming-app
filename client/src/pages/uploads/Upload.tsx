import VideoUpload from '@/components/uploads/VideoUpload';
import { useQueryClient } from '@tanstack/react-query';

const Upload = () => {
  const queryClient = useQueryClient();

  const handleUploadComplete = (videoIds: string[]) => {
    queryClient.invalidateQueries({
      queryKey: ['videos'],
    });

    videoIds.forEach((videoId) => {
      queryClient.invalidateQueries({
        queryKey: ['videos', videoId, 'processing-status'],
      });
    });
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Videos</h1>

        <p className="mt-1 text-sm text-gray-500">Upload multiple videos to your media library.</p>
      </div>

      <VideoUpload onUploadComplete={handleUploadComplete} />
    </div>
  );
};

export default Upload;
