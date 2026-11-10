import amqp, { type Channel, type ChannelModel } from "amqplib";

let connection: ChannelModel;
let channel: Channel;

const RABBITMQ_URL = process.env.RABBITMQ_URL as string;

export const connectRabbitMQ = async () => {
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  await channel.assertExchange("video.processing.exchange", "direct", {
    durable: true,
  });

  await channel.assertQueue("video.processing", {
    durable: true,
  });

  await channel.assertQueue("video.processing.retry", {
    durable: true,
    arguments: {
      "x-message-ttl": 60_000,
      "x-dead-letter-exchange": "video.processing.exchange",
      "x-dead-letter-routing-key": "video.processing",
    },
  });

  await channel.assertQueue("video.processing.dlq", {
    durable: true,
  });

  await channel.bindQueue(
    "video.processing",
    "video.processing.exchange",
    "video.processing"
  );

  await channel.prefetch(1);

  return channel;
};

export const getRabbitMQChannel = () => {
  if (!channel) throw new Error("RabbitMQ is not connected");
  return channel;
};

export const closeRabbitMQ = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};