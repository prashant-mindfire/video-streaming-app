import { randomUUID } from "crypto";
import type { PgClient } from "@/utils/withTransaction";

export const insertOutboxEvent = async (
  client: PgClient,
  eventType: string,
  payload: Record<string, unknown>
): Promise<string> => {
  const eventId = randomUUID();

  await client.query(
    `INSERT INTO outbox_events (id, event_type, payload)
     VALUES ($1, $2, $3)`,
    [eventId, eventType, JSON.stringify(payload)]
  );

  return eventId;
};
