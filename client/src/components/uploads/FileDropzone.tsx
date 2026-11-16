import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const FileDropzone = ({ onFilesSelected, disabled = false }: FileDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const selectedFiles = Array.from(files);
    const videoFiles = selectedFiles.filter((file) => file.type.startsWith('video/'));

    onFilesSelected(videoFiles);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    handleFiles(event.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <UploadCloud className="mx-auto mb-3 h-10 w-10 text-gray-400" />

      <h3 className="text-lg font-semibold text-gray-800">Upload your videos</h3>

      <p className="mt-1 text-sm text-gray-500">
        Drag and drop multiple video files here, or browse your files.
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Browse videos
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        hidden
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
};

export default FileDropzone;
