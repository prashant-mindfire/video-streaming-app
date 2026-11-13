import logger from '@/utils/logger';
import amqp, { type Channel, type ChannelModel, type ConfirmChannel } from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL as string;

let connection: ChannelModel | undefined;
let publisherChannel: ConfirmChannel | undefined;
let consumerChannel: Channel | undefined;

export const connectRabbitMQ = async () => {
  connection = await amqp.connect(RABBITMQ_URL);

  publisherChannel = await connection.createConfirmChannel();
  consumerChannel = await connection.createChannel();

  await publisherChannel.assertExchange('video.processing.exchange', 'direct', {
    durable: true,
  });

  await publisherChannel.assertQueue('video.processing', {
    durable: true,
  });

  await publisherChannel.assertQueue('video.processing.retry', {
    durable: true,
    arguments: {
      'x-message-ttl': 60_000,
      'x-dead-letter-exchange': 'video.processing.exchange',
      'x-dead-letter-routing-key': 'video.processing',
    },
  });

  await publisherChannel.assertQueue('video.processing.dlq', {
    durable: true,
  });

  await publisherChannel.bindQueue(
    'video.processing',
    'video.processing.exchange',
    'video.processing',
  );

  await consumerChannel.prefetch(1);

  logger.info('RabbitMQ connected successfully');
};

export const getRabbitMQChannel = (): ConfirmChannel => {
  if (!publisherChannel) throw new Error('RabbitMQ publisher channel is not initialized');

  return publisherChannel;
};

export const getRabbitMQConsumerChannel = (): Channel => {
  if (!consumerChannel) throw new Error('RabbitMQ consumer channel is not initialized');

  return consumerChannel;
};

export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (publisherChannel) {
      await publisherChannel.close();
      publisherChannel = undefined;
    }

    if (consumerChannel) {
      await consumerChannel.close();
      consumerChannel = undefined;
    }

    if (connection) {
      await connection.close();
      connection = undefined;
    }

    logger.info('RabbitMQ connection closed successfully');
  } catch (error) {
    logger.error('Error closing RabbitMQ publisher/consumer or connection:', error);
  }
};
