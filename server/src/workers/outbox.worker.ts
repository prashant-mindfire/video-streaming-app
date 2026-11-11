import { getRabbitMQChannel } from "@/config/rabbitmq";
import { withTransaction } from "@/utils/withTransaction";

export const publishOutboxEvents = async (): Promise<void> => {
    await withTransaction(async (client) => {
        const result = await client.query(
            `SELECT id, event_type, payload
            FROM outbox_events
            WHERE published_at IS NULL
            ORDER BY created_at
            LIMIT 20
            FOR UPDATE SKIP LOCKED`
        );

        const channel = getRabbitMQChannel();

        for (const event of result.rows) {
            const message = {
                eventId: event.id,
                ...event.payload,
            };

            const published = channel.publish(
            "video.processing.exchange",
            "video.processing",
            Buffer.from(JSON.stringify(message)),
            {
                persistent: true,
                messageId: event.id,
                contentType: "application/json",
            }
            );

            if (!published) {
                throw new Error("RabbitMQ write buffer is full");
            }           
        }

        await channel.waitForConfirms();

        const eventIds = result.rows.map((e) => e.id);
        if (eventIds.length > 0) {
            await client.query(
                `UPDATE outbox_events
                SET status = 'published', published_at = NOW()
                WHERE id = ANY($1::uuid[])`,
                [eventIds]
            );
        }
    });
};