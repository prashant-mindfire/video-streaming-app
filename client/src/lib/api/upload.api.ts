import { http } from '../http';

import type {
  InitiateUploadRequest,
  InitiateUploadResponse,
  UploadPartsResponse,
  CompleteUploadRequest,
  CompleteUploadResponse,
} from '@/types/upload';

export const initiateVideoUpload = async (
  payload: InitiateUploadRequest,
): Promise<InitiateUploadResponse> => {
  const { data } = await http.post('/videos/uploads', payload);
  return data.data;
};

export const generatePartUploadUrls = async (
  uploadId: string,
  partNumbers: number[],
): Promise<UploadPartsResponse> => {
  const { data } = await http.post(`/videos/uploads/${uploadId}/parts/upload-urls`, {
    partNumbers,
  });

  return data.data;
};

export const completeVideoUpload = async (
  uploadId: string,
  payload: CompleteUploadRequest,
): Promise<CompleteUploadResponse> => {
  const { data } = await http.post(`/videos/uploads/${uploadId}/completion`, payload);

  return data.data;
};

export const getUpload = async (uploadId: string) => {
  const { data } = await http.get(`/videos/uploads/${uploadId}`);
  return data.data;
};
