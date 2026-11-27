import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publishOutboxEvents } from '../src/workers/outbox.worker';

const mockQuery = vi.fn();
const mockPublish = vi.fn().mockReturnValue(true);
const mockWaitForConfirms = vi.fn().mockResolvedValue(undefined);

vi.mock('@/utils/withTransaction', () => ({
  withTransaction: async (fn: (client: { query: typeof mockQuery }) => Promise<void>) =>
    fn({ query: mockQuery }),
}));

vi.mock('@/config/rabbitmq', () => ({
  getRabbitMQChannel: () => ({
    publish: mockPublish,
    waitForConfirms: mockWaitForConfirms,
  }),
}));

describe('publishOutboxEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exits early without touching RabbitMQ when no unpublished events exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await publishOutboxEvents();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockPublish).not.toHaveBeenCalled();
    expect(mockWaitForConfirms).not.toHaveBeenCalled();
  });

  it('publishes pending events to RabbitMQ, waits for confirms, and updates status', async () => {
    const fakeEvents = [
      { id: '11111111-1111-1111-1111-111111111111', event_type: 'video.uploaded', payload: { videoId: 'vid-1' } },
    ];
    mockQuery
      .mockResolvedValueOnce({ rows: fakeEvents }) // SELECT FOR UPDATE SKIP LOCKED
      .mockResolvedValueOnce({ rowCount: 1 });     // UPDATE status = 'published'

    await publishOutboxEvents();

    expect(mockPublish).toHaveBeenCalledWith(
      'video.processing.exchange',
      'video.processing',
      expect.any(Buffer),
      expect.objectContaining({
        persistent: true,
        messageId: fakeEvents[0].id,
      }),
    );
    expect(mockWaitForConfirms).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenLastCalledWith(
      expect.stringContaining("SET status = 'published'"),
      [[fakeEvents[0].id]],
    );
  });
});
