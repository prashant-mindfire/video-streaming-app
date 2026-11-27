import { useEffect } from 'react';

interface UseVideoKeyboardShortcutsProps {
  containerRef: React.RefObject<HTMLElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const useVideoKeyboardShortcuts = ({ containerRef, videoRef }: UseVideoKeyboardShortcutsProps) => {
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const video = videoRef.current;

      if (!video || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const target = event.target as HTMLElement | null;

      // Don't hijack keyboard interaction with form fields,
      // buttons, menus, sliders or editable content.
      if (
        target?.isContentEditable ||
        target?.closest(
          "input, textarea, select, button, a, [role='slider'], [role='menu'], [role='menuitemradio']",
        )
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
        case 'k': {
          event.preventDefault();

          if (video.paused) {
            void video.play().catch(() => {
              // Playback may be blocked by browser policy.
            });
          } else {
            video.pause();
          }

          break;
        }

        case 'm': {
          event.preventDefault();
          video.muted = !video.muted;
          break;
        }

        case 'f': {
          event.preventDefault();

          if (document.fullscreenElement) {
            void document.exitFullscreen();
          } else {
            void container.requestFullscreen?.();
          }

          break;
        }

        case 'arrowleft': {
          event.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        }

        case 'arrowright': {
          event.preventDefault();

          const duration = Number.isFinite(video.duration) ? video.duration : Infinity;

          video.currentTime = Math.min(duration, video.currentTime + 5);

          break;
        }

        default:
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, videoRef]);
};

export default useVideoKeyboardShortcuts;
