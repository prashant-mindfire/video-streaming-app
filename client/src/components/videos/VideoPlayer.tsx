import { useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, LoaderCircle } from 'lucide-react';
import VideoQualityMenu, { type QualityLevel } from './VideoQualityMenu';
import useVideoKeyboardShortcuts from '@/hooks/useVideoKeyboardShortcuts';
import { Button, Dialog } from '../common';
import type { VideoCaption } from '@/types/video';
import CaptionControls from './CaptionControls';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
  captions?: VideoCaption[];
}

const VideoPlayer = ({ videoUrl, title, onClose, captions }: VideoPlayerProps) => {
  const [isVideoMounted, setIsVideoMounted] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Quality state: -1 represents "Auto" (Adaptive Bitrate) in HLS.js
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(-1);
  const [activeAutoHeight, setActiveAutoHeight] = useState<number | null>(null);

  // Keyboard shortcuts
  useVideoKeyboardShortcuts({
    containerRef: playerContainerRef,
    videoRef,
  });

  const setVideoNode = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    setIsVideoMounted(Boolean(node));
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!isVideoMounted || !video || !videoUrl) return;

    setIsLoading(true);
    setHasError(false);
    setQualityLevels([]);
    setSelectedLevel(-1);
    setActiveAutoHeight(null);

    let hls: Hls | null = null;
    let isCleanedUp = false;

    const handleLoaded = () => {
      if (!isCleanedUp) setIsLoading(false);
    };

    const handleError = () => {
      if (isCleanedUp) return;

      console.error('Native video element error:', video.error);

      setIsLoading(false);
      setHasError(true);
    };

    video.addEventListener('loadedmetadata', handleLoaded);
    video.addEventListener('error', handleError);

    if (Hls.isSupported()) {
      hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });

      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      // Read available resolutions from master.m3u8
      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        if (isCleanedUp) return;

        setIsLoading(false);

        const parsedLevels: QualityLevel[] = data.levels
          .map((level, index) => ({
            index,
            height: level.height,
            label: level.height ? `${level.height}p` : `Level ${index + 1}`,
          }))
          // Sort highest quality first (1080p -> 720p -> 480p)
          .sort((a, b) => b.height - a.height);

        setQualityLevels(parsedLevels);
      });

      // Track which resolution HLS.js automatically picks in "Auto" mode
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (isCleanedUp || !hls) return;

        const current = hls.levels[data.level];

        if (current?.height) {
          setActiveAutoHeight(current.height);
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('HLS playback error:', {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          response: data.response,
          url: data.url,
        });

        if (data.fatal && !isCleanedUp) {
          setHasError(true);
          setIsLoading(false);
          hls?.destroy();

          if (hlsRef.current === hls) {
            hlsRef.current = null;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else {
      setHasError(true);
      setIsLoading(false);
    }

    return () => {
      isCleanedUp = true;

      video.removeEventListener('loadedmetadata', handleLoaded);
      video.removeEventListener('error', handleError);

      if (hls) {
        hls.destroy();

        if (hlsRef.current === hls) {
          hlsRef.current = null;
        }
      }

      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [isVideoMounted, videoUrl]);

  // Handle quality selection
  const handleQualityChange = (value: string) => {
    const levelIndex = Number(value);

    setSelectedLevel(levelIndex);

    if (hlsRef.current) {
      // Setting currentLevel = -1 re-enables automatic bandwidth adaptation.
      // Setting a specific index locks playback to that resolution.
      hlsRef.current.currentLevel = levelIndex;
    }
  };

  const currentQualityLabel =
    selectedLevel === -1
      ? activeAutoHeight
        ? `Auto (${activeAutoHeight}p)`
        : 'Auto'
      : (qualityLevels.find((q) => q.index === selectedLevel)?.label ?? 'Auto');

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={`Video player: ${title}`}
      description="Use the video controls or keyboard shortcuts to control playback."
      hideHeader
      showCloseButton={false}
      contentClassName="!max-w-4xl !overflow-visible !border-0 !bg-black !p-0"
    >
      <div
        ref={playerContainerRef}
        tabIndex={0}
        role="group"
        aria-label={`${title} video player`}
        aria-describedby="video-player-shortcuts"
        className="w-full overflow-hidden rounded-xl bg-black outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
          <h2 className="truncate text-sm font-semibold text-white">{title}</h2>

          <div className="flex items-center gap-2">
            <VideoQualityMenu
              qualityLevels={qualityLevels}
              selectedLevel={selectedLevel}
              currentQualityLabel={currentQualityLabel}
              onQualityChange={handleQualityChange}
            />
            <CaptionControls videoRef={videoRef} />

            <Button
              type="button"
              onClick={onClose}
              aria-label="Close video player"
              className="rounded-md p-2 text-white outline-none hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <X size={20} aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="relative aspect-video bg-black">
          <video
            ref={setVideoNode}
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            aria-label={title}
            className="h-full w-full"
          >
            {captions?.map((caption) => (
              <track
                key={caption.id}
                kind="captions"
                src={caption.url}
                srcLang={caption.languageCode}
                label={caption.label}
                default={caption.isDefault}
              />
            ))}
            Your browser does not support HTML video.
          </video>

          {isLoading && !hasError && (
            <div
              role="status"
              aria-live="polite"
              className="absolute inset-0 flex items-center justify-center"
            >
              <LoaderCircle className="h-8 w-8 animate-spin text-white" aria-hidden="true" />
              <span className="sr-only">Loading video...</span>
            </div>
          )}

          {hasError && (
            <div
              role="alert"
              className="absolute inset-0 flex items-center justify-center bg-black/80"
            >
              <p className="text-sm text-white">
                Unable to play this video. Please try again later.
              </p>
            </div>
          )}
        </div>

        <p id="video-player-shortcuts" className="sr-only">
          Keyboard shortcuts: Space or K to play or pause, M to mute or unmute, F to toggle
          fullscreen, and left or right arrow keys to seek backward or forward by five seconds.
        </p>
      </div>
    </Dialog>
  );
};

export default VideoPlayer;
