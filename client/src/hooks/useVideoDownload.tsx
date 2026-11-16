import { createDownloadLink } from '@/lib/api/video.api';
import { useMutation } from '@tanstack/react-query';

export const useVideoDownload = () => {
  const mutation = useMutation({
    mutationFn: createDownloadLink,
  });

  const downloadVideo = async (videoId: string) => {
    const result = await mutation.mutateAsync(videoId);
    window.location.assign(result.downloadUrl);
  };

  return {
    downloadVideo,
    isDownloading: mutation.isPending,
    error: mutation.error,
  };
};
