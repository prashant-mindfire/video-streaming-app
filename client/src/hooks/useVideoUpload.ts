import { useRef, useState } from 'react';
import {
  initiateVideoUpload,
  generatePartUploadUrls,
  completeVideoUpload,
} from '../lib/api/upload.api';
import { uploadPart } from '../utils/uploadPart';
import type { UploadQueueItem, CompletedUploadPart } from '@/types/upload';

const PART_CONCURRENCY = 4;

const useVideoUpload = () => {
  const [uploads, setUploads] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadsRef = useRef<UploadQueueItem[]>([]);
  const isUploadingRef = useRef(false);

  const updateItem = (id: string, updates: Partial<UploadQueueItem>) => {
    const updated = uploadsRef.current.map((item) =>
      item.id === id ? { ...item, ...updates } : item,
    );

    uploadsRef.current = updated;
    setUploads(updated);
  };

  const addFiles = (files: File[]) => {
    const newItems: UploadQueueItem[] = files
      .filter((file) => file.type.startsWith('video/'))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'queued',
      }));

    const updated = [...uploadsRef.current, ...newItems];

    uploadsRef.current = updated;
    setUploads(updated);
  };

  const uploadSingleFile = async (item: UploadQueueItem) => {
    try {
      updateItem(item.id, {
        status: 'uploading',
        progress: 0,
        error: undefined,
      });

      // Initiate multipart upload.
      const { uploadId, partSize } = await initiateVideoUpload({
        fileName: item.file.name,
        contentType: item.file.type,
        fileSize: item.file.size,
      });

      updateItem(item.id, { uploadId });

      if (!Number.isFinite(partSize) || partSize <= 0) {
        throw new Error('Invalid part size returned by the server.');
      }

      // Calculate the multipart chunks.
      const totalParts = Math.ceil(item.file.size / partSize);

      if (totalParts === 0 || totalParts > 10000) {
        throw new Error('Invalid number of multipart upload parts.');
      }

      const partNumbers = Array.from({ length: totalParts }, (_, index) => index + 1);

      // Generate presigned URLs in a single batch.
      const { parts } = await generatePartUploadUrls(uploadId, partNumbers);

      const urlMap = new Map(parts.map((part) => [part.partNumber, part.uploadUrl]));

      for (const partNumber of partNumbers) {
        if (!urlMap.has(partNumber)) {
          throw new Error(`Missing upload URL for part ${partNumber}.`);
        }
      }

      const completedParts: CompletedUploadPart[] = [];
      const loadedBytes = new Map<number, number>();

      const updateProgress = () => {
        const uploadedBytes = Array.from(loadedBytes.values()).reduce(
          (total, loaded) => total + loaded,
          0,
        );

        const progress = Math.min(99, Math.round((uploadedBytes / item.file.size) * 100));

        updateItem(item.id, { progress });
      };

      // Upload parts with limited concurrency.
      let nextIndex = 0;

      const uploadWorker = async () => {
        while (true) {
          const currentIndex = nextIndex++;

          if (currentIndex >= partNumbers.length) return;

          const partNumber = partNumbers[currentIndex];

          const start = (partNumber - 1) * partSize;
          const end = Math.min(start + partSize, item.file.size);

          const chunk = item.file.slice(start, end);
          const uploadUrl = urlMap.get(partNumber)!;

          const etag = await uploadPart(uploadUrl, chunk, (loaded) => {
            loadedBytes.set(partNumber, loaded);
            updateProgress();
          });

          loadedBytes.set(partNumber, chunk.size);

          completedParts.push({
            partNumber,
            etag,
          });

          updateProgress();
        }
      };

      const workers = Array.from(
        {
          length: Math.min(PART_CONCURRENCY, totalParts),
        },
        () => uploadWorker(),
      );

      // Wait for all active workers to settle before handling failure.
      const results = await Promise.allSettled(workers);

      const failedWorker = results.find((result) => result.status === 'rejected');

      if (failedWorker?.status === 'rejected') {
        throw failedWorker.reason;
      }

      // Complete the multipart upload.
      completedParts.sort((a, b) => a.partNumber - b.partNumber);

      const result = await completeVideoUpload(uploadId, {
        parts: completedParts,
      });

      if (!result.videoId) {
        throw new Error('The completion response did not include a video ID.');
      }

      // Upload is complete. Processing is tracked separately.
      updateItem(item.id, {
        status: 'uploaded',
        progress: 100,
        videoId: result.videoId,
      });

      return result.videoId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to upload video.';

      updateItem(item.id, {
        status: 'failed',
        error: message,
      });

      return undefined;
    }
  };

  const startUploads = async (): Promise<string[]> => {
    if (isUploadingRef.current) return [];

    const queuedItems = uploadsRef.current.filter((item) => item.status === 'queued');

    if (queuedItems.length === 0) return [];

    const videoIds: string[] = [];

    isUploadingRef.current = true;
    setIsUploading(true);

    try {
      for (const item of queuedItems) {
        const videoId = await uploadSingleFile(item);

        if (videoId) {
          videoIds.push(videoId);
        }
      }

      return videoIds;
    } finally {
      isUploadingRef.current = false;
      setIsUploading(false);
    }
  };

  const removeQueuedItem = (id: string) => {
    const item = uploadsRef.current.find((upload) => upload.id === id);

    if (!item || item.status === 'uploading') return;

    const updated = uploadsRef.current.filter((upload) => upload.id !== id);

    uploadsRef.current = updated;
    setUploads(updated);
  };

  return {
    uploads,
    isUploading,
    addFiles,
    startUploads,
    removeQueuedItem,
  };
};

export default useVideoUpload;
