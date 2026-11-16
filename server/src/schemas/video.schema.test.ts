import { describe, expect, it } from 'vitest';
import { listVideosSchema } from './video.schema';

describe('listVideosSchema', () => {
  it('accepts the frontend video list query with blank optional filters', () => {
    const result = listVideosSchema.safeParse({
      query: {
        search: '',
        status: '',
        sortBy: 'newest',
        page: '1',
        pageSize: '12',
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toMatchObject({ page: 1, pageSize: 12, sortBy: 'newest' });
      expect(result.data.query.search).toBeUndefined();
      expect(result.data.query.status).toBeUndefined();
    }
  });

  it('rejects statuses that are not video processing states', () => {
    const result = listVideosSchema.safeParse({ query: { status: 'uploaded' } });

    expect(result.success).toBe(false);
  });
});
