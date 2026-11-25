import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VideoCard } from '@/components/videos/VideoCard';
import type { Video } from '@/types/video';

vi.mock('@/components/videos/ProcessingProgress', () => ({
  ProcessingProgress: ({ videoId }: { videoId: string }) => <p>Processing {videoId}</p>,
}));

const video: Video = {
  id: '123e4567-e89b-42d3-a456-426614174000',
  title: 'Demo clip',
  fileSize: 1_048_576,
  status: 'ready',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('VideoCard', () => {
  it('offers playback and download actions for ready videos', () => {
    const onPlay = vi.fn();
    const onDownload = vi.fn();
    const onDelete = vi.fn();

    render(<VideoCard video={video} onPlay={onPlay} onDownload={onDownload} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Play Demo clip' }));
    fireEvent.click(screen.getByRole('button', { name: 'Download Demo clip' }));

    expect(onPlay).toHaveBeenCalledWith(video);
    expect(onDownload).toHaveBeenCalledWith(video);
  });

  it('shows processing progress without ready-only actions', () => {
    const onPlay = vi.fn();
    const onDownload = vi.fn();
    const onDelete = vi.fn();

    render(
      <VideoCard
        video={{ ...video, status: 'processing' }}
        onPlay={onPlay}
        onDownload={onDownload}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText(`Processing ${video.id}`)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Play Demo clip' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Download Demo clip' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Delete Demo clip' }));
    expect(onDelete).toHaveBeenCalledWith({ ...video, status: 'processing' });
  });
});
