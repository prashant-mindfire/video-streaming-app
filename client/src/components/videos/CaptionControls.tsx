import { useEffect, useState } from 'react';
import { Captions } from 'lucide-react';

interface CaptionControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const CaptionControls = ({ videoRef }: CaptionControlsProps) => {
  const [enabled, setEnabled] = useState(false);
  const [hasCaptions, setHasCaptions] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const updateTracks = () => {
      const tracks = Array.from(video.textTracks).filter(
        (track) => track.kind === 'captions' || track.kind === 'subtitles',
      );

      setHasCaptions(tracks.length > 0);

      tracks.forEach((track) => {
        track.mode = enabled ? 'showing' : 'disabled';
      });
    };

    video.addEventListener('loadedmetadata', updateTracks);
    video.addEventListener('loadeddata', updateTracks);

    updateTracks();

    return () => {
      video.removeEventListener('loadedmetadata', updateTracks);
      video.removeEventListener('loadeddata', updateTracks);
    };
  }, [enabled, videoRef]);

  if (!hasCaptions) return null;

  const toggleCaptions = () => {
    const video = videoRef.current;

    if (!video) return;

    const nextEnabled = !enabled;

    Array.from(video.textTracks).forEach((track) => {
      if (track.kind === 'captions' || track.kind === 'subtitles') {
        track.mode = nextEnabled ? 'showing' : 'disabled';
      }
    });

    setEnabled(nextEnabled);
  };

  return (
    <button
      type="button"
      onClick={toggleCaptions}
      aria-label={enabled ? 'Turn captions off' : 'Turn captions on'}
      aria-pressed={enabled}
      className="
        rounded-md p-2 text-white
        hover:bg-white/10
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-white
      "
    >
      <Captions size={20} aria-hidden="true" />
    </button>
  );
};

export default CaptionControls;
