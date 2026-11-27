import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startVideoWorker } from '../src/workers/video.worker';

let capturedConsumer: ((msg: unknown) => Promise<void>) | null = null;

const mockAck = vi.fn();
const mockSendToQueue = vi.fn();
const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
const mockProcessVideo = vi.fn();

vi.mock('../src/config/rabbitmq', () => ({
  connectRabbitMQ: vi.fn().mockResolvedValue(undefined),
  closeRabbitMQ: vi.fn().mockResolvedValue(undefined),
  getRabbitMQConsumerChannel: () => ({
    consume: vi.fn(async (_queue: string, cb: (msg: unknown) => Promise<void>) => {
      capturedConsumer = cb;
      return { consumerTag: 'test-consumer' };
    }),
    ack: mockAck,
    sendToQueue: mockSendToQueue,
    cancel: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('../src/workers/video.processor', () => ({
  processVideo: (...args: unknown[]) => mockProcessVideo(...args),
}));

vi.mock('@/config/db', () => ({
  pool: { query: (...args: unknown[]) => mockQuery(...args) },
  closePool: vi.fn().mockResolvedValue(undefined),
}));

const makeMessage = (payload: object, attempt = 1) => ({
  content: Buffer.from(JSON.stringify(payload)),
  properties: {
    messageId: 'msg-123',
    headers: { 'x-attempt': attempt },
  },
});

describe('startVideoWorker', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    capturedConsumer = null;
    await startVideoWorker();
  });

  it('processes video and acknowledges message on success', async () => {
    mockProcessVideo.mockResolvedValueOnce(undefined);
    const msg = makeMessage({ jobId: 'job-1', videoId: 'vid-1' }, 1);

    await capturedConsumer!(msg);

    expect(mockProcessVideo).toHaveBeenCalledWith({ jobId: 'job-1', videoId: 'vid-1' });
    expect(mockAck).toHaveBeenCalledWith(msg);
    expect(mockSendToQueue).not.toHaveBeenCalled();
  });

  it('routes failed job to retry queue when attempts < MAX_ATTEMPTS', async () => {
    mockProcessVideo.mockRejectedValueOnce(new Error('FFmpeg exited with code 1'));
    const msg = makeMessage({ jobId: 'job-1', videoId: 'vid-1' }, 1);

    await capturedConsumer!(msg);

    expect(mockSendToQueue).toHaveBeenCalledWith(
      'video.processing.retry',
      msg.content,
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-attempt': 2 }),
      }),
    );
    expect(mockAck).toHaveBeenCalledWith(msg);
  });

  it('routes failed job to DLQ when attempts reach MAX_ATTEMPTS (3)', async () => {
    mockProcessVideo.mockRejectedValueOnce(new Error('Corrupt video stream'));
    const msg = makeMessage({ jobId: 'job-1', videoId: 'vid-1' }, 3);

    await capturedConsumer!(msg);

    expect(mockSendToQueue).toHaveBeenCalledWith(
      'video.processing.dlq',
      msg.content,
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-attempt': 3 }),
      }),
    );
    expect(mockAck).toHaveBeenCalledWith(msg);
  });
});
