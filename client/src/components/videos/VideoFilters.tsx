import { useForm } from 'react-hook-form';
import { Form } from '../common/Form';
import { Input } from '../common/Input';
import { SelectInput } from '../common/SelectInput';
import { Button } from '../common/Button';
import type { VideoFilters as VideoFiltersType } from '@/types/video';

interface VideoFiltersProps {
  onApply: (filters: VideoFiltersType) => void;
}

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Queued', value: 'queued' },
  { label: 'Processing', value: 'processing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Failed', value: 'failed' },
];

const sortOptions = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Title', value: 'title' },
];

export const VideoFilters = ({ onApply }: VideoFiltersProps) => {
  const methods = useForm<VideoFiltersType>({
    defaultValues: {
      search: '',
      status: '',
      sortBy: 'newest',
    },
  });

  return (
    <Form
      methods={methods}
      onSubmit={onApply}
      className="mb-6 flex flex-col gap-4 md:flex-row md:items-end"
    >
      <div className="flex-1">
        <Input<VideoFiltersType>
          name="search"
          label="Search videos"
          placeholder="Search by video title..."
        />
      </div>

      <div className="w-full md:w-48">
        <SelectInput<VideoFiltersType> name="status" label="Status" options={statusOptions} />
      </div>

      <div className="w-full md:w-48">
        <SelectInput<VideoFiltersType> name="sortBy" label="Sort by" options={sortOptions} />
      </div>

      <Button type="submit">Apply Filters</Button>
    </Form>
  );
};
