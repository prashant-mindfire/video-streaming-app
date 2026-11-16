import { http } from '@/lib/http';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  PlaybackResponse,
  Video,
  VideoDetail,
  VideoProcessingStatus,
  VideoQueryFilters,
} from '@/types/video';

export const getVideos = async (filters: VideoQueryFilters) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      return typeof value !== 'string' || value.trim() !== '';
    }),
  );

  const { data } = await http.get<ApiResponse<PaginatedResponse<Video>>>('/videos', { params });

  return data.data;
};

export const getVideo = async (videoId: string) => {
  const { data } = await http.get<ApiResponse<VideoDetail>>(`/videos/${videoId}`);

  return data.data;
};

export const deleteVideo = async (videoId: string) => {
  const { data } = await http.delete(`/videos/${videoId}`);
  return data;
};

export const getProcessingStatus = async (videoId: string) => {
  const { data } = await http.get(`/videos/${videoId}/processing-status`);

  return data.data;
};

export const createPlaybackSession = async (videoId: string) => {
  const { data } = await http.post(`/videos/${videoId}/playback-sessions`);

  return data.data;
};

export const createDownloadLink = async (videoId: string) => {
  const { data } = await http.get(`/videos/${videoId}/download-links`);

  return data.data;
};

export const getVideoPlaybackUrl = async (videoId: string): Promise<PlaybackResponse> => {
  const { data } = await http.post(`/videos/${videoId}/playback-sessions`);

  return data.data;
};

export const getVideoProcessingStatus = async (videoId: string): Promise<VideoProcessingStatus> => {
  const { data } = await http.get(`/videos/${videoId}/processing-status`);

  return data.data;
};
