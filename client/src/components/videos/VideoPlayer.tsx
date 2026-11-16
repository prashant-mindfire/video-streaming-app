import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, LoaderCircle, Settings } from 'lucide-react';
import { Button } from '../common';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
}

interface QualityLevel {
  index: number;
  label: string;
  height: number;
}

const VideoPlayer = ({ videoUrl, title, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Quality state: -1 represents "Auto" (Adaptive Bitrate) in HLS.js
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(-1);
  const [activeAutoHeight, setActiveAutoHeight] = useState<number | null>(null);
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

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

      // rack which resolution HLS.js automatically picks in "Auto" mode
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
        hlsRef.current = null;
      }
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [videoUrl]);

  const handleQualityChange = (levelIndex: number) => {
    setSelectedLevel(levelIndex);
    setIsQualityMenuOpen(false);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-xl bg-black shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
          <h2 className="truncate text-sm font-semibold text-white">{title}</h2>

          <div className="flex items-center gap-2">
            {qualityLevels.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsQualityMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-md bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                  aria-label="Select video quality"
                >
                  <Settings size={14} />
                  <span>{currentQualityLabel}</span>
                </button>

                {isQualityMenuOpen && (
                  <div className="absolute right-0 z-20 mt-1.5 w-36 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 py-1 shadow-xl">
                    <button
                      type="button"
                      onClick={() => handleQualityChange(-1)}
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-800 ${
                        selectedLevel === -1 ? 'font-semibold text-blue-400' : 'text-gray-200'
                      }`}
                    >
                      <span>Auto</span>
                      {selectedLevel === -1 && <span>✓</span>}
                    </button>

                    {qualityLevels.map((level) => (
                      <button
                        key={level.index}
                        type="button"
                        onClick={() => handleQualityChange(level.index)}
                        className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-800 ${
                          selectedLevel === level.index
                            ? 'font-semibold text-blue-400'
                            : 'text-gray-200'
                        }`}
                      >
                        <span>{level.label}</span>
                        {selectedLevel === level.index && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={onClose}
              className="rounded-md p-2 text-white hover:bg-gray-700"
              aria-label="Close video player"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="relative aspect-video bg-black">
          <video ref={videoRef} controls autoPlay muted playsInline className="h-full w-full" />

          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-white" />
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-white">
                Unable to play this video. Please try again later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
