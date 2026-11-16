import { useQuery } from '@tanstack/react-query';
import { getVideos } from '@/lib/api/video.api';
import type { VideoQueryFilters } from '@/types/video';

export const useVideos = (filters: VideoQueryFilters) => {
  return useQuery({
    queryKey: ['videos', filters],
    queryFn: () => getVideos(filters),
  });
};
