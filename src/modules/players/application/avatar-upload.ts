import { and, eq, isNull, sql } from "drizzle-orm";
import { AppError } from "@/lib/errors";
import * as authSchema from "@/lib/db/auth-schema";
import { createPlayersDatabase } from "../infra/database";
import { isPostgresDivisionByZero } from "../infra/postgres-errors";
import * as schema from "../infra/schema";
import { isAccountDeletionPending } from "./profile";

const MAX_AVATAR_UPLOAD_WAIT_MS = 60_000;
const INITIAL_POLL_DELAY_MS = 50;
const MAX_POLL_DELAY_MS = 500;

export async function beginAvatarUpload(userId: string): Promise<boolean> {
  const database = await createPlayersDatabase();

  if ("batch" in database) {
    try {
      const lockActiveUser = database.execute(sql`
        SELECT 1 / COUNT(*)
        FROM (
          SELECT ${authSchema.user.id}
          FROM ${authSchema.user}
          WHERE ${authSchema.user.id} = ${userId}
            AND ${authSchema.user.deletedAt} IS NULL
          FOR UPDATE
        ) AS active_user
      `);
      const createReservation = database
        .insert(schema.avatarUploads)
        .values({ userId })
        .onConflictDoNothing()
        .returning({ userId: schema.avatarUploads.userId });
      const [, reservations] = await database.batch([lockActiveUser, createReservation]);
      return reservations.length > 0;
    } catch (error: unknown) {
      if (isPostgresDivisionByZero(error) && (await isAccountDeletionPending(userId))) {
        return false;
      }
      throw error;
    }
  }

  return database.transaction(async (transaction) => {
    const [activeUser] = await transaction
      .select({ id: authSchema.user.id })
      .from(authSchema.user)
      .where(and(eq(authSchema.user.id, userId), isNull(authSchema.user.deletedAt)))
      .for("update")
      .limit(1);
    if (activeUser === undefined) return false;

    const [reservation] = await transaction
      .insert(schema.avatarUploads)
      .values({ userId })
      .onConflictDoNothing()
      .returning({ userId: schema.avatarUploads.userId });
    return reservation !== undefined;
  });
}

export async function finishAvatarUpload(userId: string): Promise<void> {
  const database = await createPlayersDatabase();
  await database.delete(schema.avatarUploads).where(eq(schema.avatarUploads.userId, userId));
}

export async function waitForAvatarUpload(userId: string): Promise<void> {
  const database = await createPlayersDatabase();
  const deadline = Date.now() + MAX_AVATAR_UPLOAD_WAIT_MS;
  let delayMs = INITIAL_POLL_DELAY_MS;

  while (true) {
    const [reservation] = await database
      .select({ userId: schema.avatarUploads.userId })
      .from(schema.avatarUploads)
      .where(eq(schema.avatarUploads.userId, userId))
      .limit(1);
    if (reservation === undefined) return;
    if (Date.now() >= deadline) {
      throw new AppError(
        "La baja está esperando a que termine una subida de foto. Vuelve a intentarlo en unos instantes.",
        "CONFLICT",
      );
    }

    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    delayMs = Math.min(delayMs * 2, MAX_POLL_DELAY_MS);
  }
}
