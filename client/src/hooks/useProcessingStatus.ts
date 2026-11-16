import { useQuery } from '@tanstack/react-query';
import { getVideoProcessingStatus } from '../lib/api/video.api';

export const useProcessingStatus = (videoId?: string) => {
  return useQuery({
    queryKey: ['videos', videoId, 'processing-status'],

    queryFn: () => getVideoProcessingStatus(videoId!),

    enabled: Boolean(videoId),

    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (status === 'ready' || status === 'failed') {
        return false;
      }

      return 3000;
    },

    refetchOnWindowFocus: true,
  });
};
