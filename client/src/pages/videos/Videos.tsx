import { useState } from 'react';
import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Pagination } from '../../components/common/Pagination';
import { VideoFilters } from '../../components/videos/VideoFilters';
import { VideoGrid } from '../../components/videos/VideoGrid';
import { useVideos } from '../../hooks/useVideos';
import type { Video, VideoFilters as VideoFiltersType, VideoQueryFilters } from '@/types/video';
import { useMutation } from '@tanstack/react-query';
import { getVideoPlaybackUrl } from '@/lib/api/video.api';
import VideoPlayer from '@/components/videos/VideoPlayer';
import { getErrorMessage } from '@/utils/errorHandler';
import { http } from '@/lib/http';
import { useDeleteVideo } from '@/hooks/useDeleteVideo';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { useToast } from '@/components/common/toast/useToast';
import { useVideoDownload } from '@/hooks/useVideoDownload';

const Videos = () => {
  const [page, setPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const [filters, setFilters] = useState<VideoFiltersType>({
    search: '',
    status: '',
    sortBy: 'newest',
  });

  const queryFilters: VideoQueryFilters = {
    ...filters,
    page,
    pageSize: 10,
  };

  const { data, isLoading, isError } = useVideos(queryFilters);

  const playbackMutation = useMutation({
    mutationFn: getVideoPlaybackUrl,
  });

  const deleteMutation = useDeleteVideo();

  const { downloadVideo, isDownloading } = useVideoDownload();

  const toast = useToast();

  const handleApplyFilters = (values: VideoFiltersType) => {
    setFilters(values);
    setPage(1);
  };

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    playbackMutation.mutate(video.id);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
    playbackMutation.reset();
  };

  const { open: openDeleteDialog, dialog: deleteDialog } = useConfirmDialog<Video>({
    title: 'Delete Video',
    message: (video) =>
      `Are you sure you want to delete "${video.title}"? This action cannot be undone.`,
    confirmText: 'Delete',
    variant: 'danger',
    onConfirm: async (video) => {
      await deleteMutation.mutateAsync(video.id);
    },
  });

  const handleDeleteVideo = (video: Video) => {
    openDeleteDialog(video);
  };

  const handleDownloadVideo = async (video: Video) => {
    try {
      await downloadVideo(video.id);
    } catch (error) {
      toast.error(`Failed to upload videos: ${error}.`);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and monitor your uploaded videos.</p>
          </div>

          <Link to="/upload">
            <Button>
              <Plus size={18} className="mr-2" />
              Upload Videos
            </Button>
          </Link>
        </div>

        <VideoFilters onApply={handleApplyFilters} />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">Failed to load videos. Please try again.</p>
          </div>
        ) : (
          <>
            <VideoGrid
              videos={data?.videos ?? []}
              onDelete={handleDeleteVideo}
              onPlay={handlePlayVideo}
              onDownload={handleDownloadVideo}
              isDownloading={isDownloading}
            />

            {data && (
              <Pagination
                page={data.page}
                totalItems={data.total}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            )}
            {selectedVideo && (
              <>
                {playbackMutation.isPending && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <Spinner />
                    <p className="ml-3 text-white">Preparing video...</p>
                  </div>
                )}

                {playbackMutation.isError && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="rounded-lg bg-white p-6">
                      <p className="mb-4 text-red-600">{getErrorMessage(playbackMutation.error)}</p>
                      <Button onClick={handleClosePlayer}>Close</Button>
                    </div>
                  </div>
                )}

                {playbackMutation.isSuccess && playbackMutation.data && (
                  <VideoPlayer
                    videoUrl={new URL(
                      playbackMutation.data.streamUrl,
                      http.defaults.baseURL?.startsWith('http')
                        ? http.defaults.baseURL
                        : window.location.origin,
                    ).toString()}
                    title={selectedVideo.title}
                    onClose={handleClosePlayer}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
      {deleteDialog}
    </>
  );
};

export default Videos;
