import { useRef, useState } from 'react';
import { CloudUpload } from 'lucide-react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFileSizeMB?: number;
}

const FileDropzone = ({
  onFilesSelected,
  disabled = false,
  maxFileSizeMB = 500,
}: FileDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const openFilePicker = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);

    const validFiles: File[] = [];
    const rejectedFiles: string[] = [];

    files.forEach((file) => {
      if (!file.type.startsWith('video/')) {
        rejectedFiles.push(`${file.name}: unsupported file type`);
        return;
      }

      if (file.size > maxFileSizeMB * 1024 * 1024) {
        rejectedFiles.push(`${file.name}: exceeds the ${maxFileSizeMB} MB limit`);
        return;
      }

      validFiles.push(file);
    });

    setError(rejectedFiles.join('. '));

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFilePicker();
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby="dropzone-description"
        onClick={openFilePicker}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          event.preventDefault();

          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
        className={`
          flex min-h-52 cursor-pointer flex-col
          items-center justify-center rounded-xl
          border-2 border-dashed p-8 text-center
          transition-colors
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-blue-600
          focus-visible:ring-offset-2
          ${
            isDragging
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-500'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <CloudUpload size={40} aria-hidden="true" className="mb-3 text-gray-600" />

        <p className="font-semibold text-gray-800">Drag and drop your videos here</p>

        <p className="mt-1 text-sm text-gray-600">Or click to browse files</p>

        <p id="dropzone-description" className="mt-3 text-sm text-gray-600">
          Video files only. Maximum file size: {maxFileSizeMB} MB per file. Multiple files
          supported.
        </p>

        {isDragging && (
          <p className="mt-3 text-sm font-medium text-blue-700">Release to add your videos.</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          disabled={disabled}
          className="sr-only"
          aria-label="Choose video files"
          onChange={(event) => {
            if (event.target.files) {
              handleFiles(event.target.files);
            }

            // Allow selecting the same file again.
            event.target.value = '';
          }}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileDropzone;
