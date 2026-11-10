import { connectRabbitMQ } from "@/config/rabbitmq";
import { publishOutboxEvents } from "./outbox.worker";
import logger from "@/utils/logger";

const start = async () => {
  await connectRabbitMQ();

  logger.info("Outbox publisher started");

  const run = async () => {
    try {
      await publishOutboxEvents();
    } catch (error) {
        logger.error("Outbox publishing failed:", error);
    }
  };

  await run();
  setInterval(run, 2000);
};

start().catch((error) => logger.error("Something went wrong in start outbox runner:", error));