import { AccessibleProgress } from '@/components/common/AccessibleProgress';
import { useProcessingStatus } from '@/hooks/useProcessingStatus';

interface ProcessingProgressProps {
  videoId: string;
}

export const ProcessingProgress = ({ videoId }: ProcessingProgressProps) => {
  const { data, isLoading, isError } = useProcessingStatus(videoId);

  if (isLoading) {
    return (
      <p role="status" className="text-sm text-gray-600">
        Checking video processing status...
      </p>
    );
  }

  if (isError || !data) {
    return (
      <p role="alert" className="text-sm text-red-700">
        Unable to retrieve video processing status.
      </p>
    );
  }

  const status =
    data.status === 'ready'
      ? 'completed'
      : data.status === 'failed'
        ? 'failed'
        : data.status === 'queued'
          ? 'queued'
          : 'processing';

  return (
    <AccessibleProgress
      label="Video processing"
      progress={data.progress}
      status={status}
      stage={data.currentStage}
      error={data.status === 'failed' ? data.currentStage || 'Video processing failed.' : undefined}
    />
  );
};
