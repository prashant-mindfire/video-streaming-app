export type ProgressStatus = 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';

interface AccessibleProgressProps {
  label: string;
  progress: number;
  status: ProgressStatus;
  stage?: string;
  error?: string;
}

export const AccessibleProgress = ({
  label,
  progress,
  status,
  stage,
  error,
}: AccessibleProgressProps) => {
  const safeProgress = Math.min(100, Math.max(0, progress));

  const milestone = Math.floor(safeProgress / 10) * 10;
  const announcement =
    status === 'failed'
      ? ''
      : status === 'completed'
        ? `${label} completed successfully.`
        : status === 'queued'
          ? `${label} is queued.`
          : stage
            ? `${label}: ${stage}.`
            : milestone > 0 && milestone < 100
              ? `${label} is ${milestone}% complete.`
              : '';

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-gray-700">{label}</span>

        <span className="tabular-nums text-gray-700">{Math.round(safeProgress)}%</span>
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(safeProgress)}
        aria-valuetext={`${Math.round(safeProgress)}% complete`}
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${safeProgress}%` }}
        />
      </div>

      {stage && status === 'processing' && <p className="text-sm text-gray-600">{stage}</p>}

      {/*
        Announce meaningful changes, not every XHR progress event.
        The error is announced separately through role="alert".
      */}
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>

      {status === 'failed' && error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
};
