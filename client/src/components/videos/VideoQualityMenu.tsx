import { Check, Settings } from 'lucide-react';
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
} from '../common/dropdown-menu';

export interface QualityLevel {
  index: number;
  label: string;
  height: number;
}

interface VideoQualityMenuProps {
  qualityLevels: QualityLevel[];
  selectedLevel: number;
  currentQualityLabel: string;
  onQualityChange: (value: string) => void;
}

const VideoQualityMenu = ({
  qualityLevels,
  selectedLevel,
  currentQualityLabel,
  onQualityChange,
}: VideoQualityMenuProps) => {
  if (qualityLevels.length === 0) return null;

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Select video quality. Current quality: ${currentQualityLabel}`}
          aria-expanded
          className="flex items-center gap-1.5 rounded-md bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-white outline-none hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Settings size={14} aria-hidden="true" />
          <span>{currentQualityLabel}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        className="z-70! w-36! border-gray-700! bg-gray-900! py-1!"
        role="menu"
        aria-label="Video quality"
      >
        <DropdownMenuLabel className="px-3! py-1.5! text-xs! text-gray-600!">
          Video quality
        </DropdownMenuLabel>

        <DropdownMenuRadioGroup value={String(selectedLevel)} onValueChange={onQualityChange}>
          <DropdownMenuRadioItem
            value="-1"
            className="flex! justify-between! px-3! py-1.5! text-xs! text-gray-200! data-highlighted:bg-gray-800! data-[state=checked]:font-semibold! data-[state=checked]:text-blue-400!"
            role="menuitemradio"
          >
            <span>Auto</span>

            <DropdownMenuItemIndicator aria-checked>
              <Check size={14} aria-hidden="true" />
            </DropdownMenuItemIndicator>
          </DropdownMenuRadioItem>

          {qualityLevels.map((level) => (
            <DropdownMenuRadioItem
              key={level.index}
              value={String(level.index)}
              className="flex! justify-between! px-3! py-1.5! text-xs! text-gray-200! data-highlighted:bg-gray-800! data-[state=checked]:font-semibold! data-[state=checked]:text-blue-400!"
              role="menuitemradio"
            >
              <span>{level.label}</span>

              <DropdownMenuItemIndicator aria-checked={selectedLevel === level.index}>
                <Check size={14} aria-hidden="true" />
              </DropdownMenuItemIndicator>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};

export default VideoQualityMenu;
