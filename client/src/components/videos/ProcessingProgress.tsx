import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useProcessingStatus } from '../../hooks/useProcessingStatus';

interface ProcessingProgressProps {
  videoId: string;
}

export const ProcessingProgress = ({ videoId }: ProcessingProgressProps) => {
  const { data, isLoading, isError } = useProcessingStatus(videoId);

  if (isLoading) {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading processing status...
      </div>
    );
  }

  if (isError || !data) {
    return <p className="mt-3 text-xs text-red-600">Unable to retrieve processing status.</p>;
  }

  if (data.status === 'ready') {
    return (
      <div className="mt-3 flex items-center gap-2 text-sm font-medium text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        Video processing completed
      </div>
    );
  }

  if (data.status === 'failed') {
    return (
      <div className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600">
        <XCircle className="h-4 w-4" />
        Video processing failed
      </div>
    );
  }

  const progress = Math.min(100, Math.max(0, data.progress ?? 0));

  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {data.currentStage || 'Processing video'}
        </span>

        <span>{progress}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
