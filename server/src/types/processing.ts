export interface VideoProcessingMessage {
  eventId: string;
  jobId: string;
  videoId: string;
  userId: string;
  originalObjectKey: string;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
}
