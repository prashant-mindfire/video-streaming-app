import { redis } from "@/config/redis";

interface VideoProgress {
  status: "queued" | "processing" | "ready" | "failed";
  progress: number;
  currentStage: string;
  updatedAt: string;
}

export const updateVideoProgress = async (
  videoId: string,
  progress: number,
  currentStage: string,
  status: VideoProgress["status"] = "processing"
) => {
  const data: VideoProgress = {
    status,
    progress,
    currentStage,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(
    `video:${videoId}:progress`,
    JSON.stringify(data),
    "EX",
    3600
  );
};

export const getVideoProgress = async (videoId: string) => {
  const data = await redis.get(`video:${videoId}:progress`);

  return data ? (JSON.parse(data) as VideoProgress) : null;
};

export const deleteVideoProgress = async (videoId: string) => {
  await redis.del(`video:${videoId}:progress`);
};