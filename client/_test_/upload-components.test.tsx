import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FileDropzone from '@/components/uploads/FileDropzone';
import UploadItem from '@/components/uploads/UploadItem';
import type { UploadQueueItem } from '@/types/upload';

describe('FileDropzone', () => {
  it('only adds selected video files to the upload queue', () => {
    const onFilesSelected = vi.fn();
    const video = new File(['video'], 'clip.mp4', { type: 'video/mp4' });
    const image = new File(['image'], 'cover.png', { type: 'image/png' });
    const { container } = render(<FileDropzone onFilesSelected={onFilesSelected} />);
    const input = container.querySelector('input[type="file"]');

    if (!(input instanceof HTMLInputElement)) {
      throw new Error('Expected the file picker input to be rendered.');
    }

    fireEvent.change(input, { target: { files: [video, image] } });

    expect(onFilesSelected).toHaveBeenCalledWith([video]);
  });

  it('disables browsing while an upload is in progress', () => {
    const onFilesSelected = vi.fn();

    render(<FileDropzone onFilesSelected={onFilesSelected} disabled />);

    expect(screen.getByRole('button', { name: 'Browse videos' })).toBeDisabled();
  });
});

describe('UploadItem', () => {
  const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' });

  it('shows progress and prevents removing an uploading file', () => {
    const onRemove = vi.fn();
    const upload: UploadQueueItem = {
      id: 'upload-1',
      file,
      progress: 45,
      status: 'uploading',
    };

    render(<UploadItem upload={upload} onRemove={onRemove} />);

    expect(screen.getByText('Uploading')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove clip.mp4' })).toBeNull();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('allows removing a queued file', () => {
    const onRemove = vi.fn();
    const upload: UploadQueueItem = {
      id: 'upload-2',
      file,
      progress: 0,
      status: 'queued',
    };

    render(<UploadItem upload={upload} onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove clip.mp4' }));

    expect(onRemove).toHaveBeenCalledWith('upload-2');
  });
});
