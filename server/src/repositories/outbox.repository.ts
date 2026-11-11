import { randomUUID } from "crypto";
import type { PgClient } from "@/utils/withTransaction";

export const insertOutboxEvent = async (
  client: PgClient,
  eventType: string,
  jobId: string,
  payload: Record<string, unknown>
): Promise<string> => {
  const eventId = randomUUID();

  await client.query(
    `INSERT INTO outbox_events (id, job_id, event_type, payload)
     VALUES ($1, $2, $3, $4)`,
    [eventId, jobId, eventType, JSON.stringify(payload)]
  );

  return eventId;
};
