import { and, eq, isNull, lte, gt, sql } from "drizzle-orm";
import { AppError } from "@/lib/errors";
import * as authSchema from "@/lib/db/auth-schema";
import { createPlayersDatabase } from "../infra/database";
import { isPostgresDivisionByZero } from "../infra/postgres-errors";
import * as schema from "../infra/schema";
import { isAccountDeletionPending } from "./profile";
import {
  isPlaywrightE2E,
  notifyE2EAvatarReservationReleased,
} from "@/lib/e2e/avatar-upload-barrier";

const AVATAR_PREPARATION_LEASE_MS = 5 * 60 * 1000;
const MAX_AVATAR_UPLOAD_WAIT_MS = 60_000;
const INITIAL_POLL_DELAY_MS = 50;
const MAX_POLL_DELAY_MS = 500;
const PREPARING = "preparing";
const WRITING = "writing";

export async function beginAvatarUpload(userId: string): Promise<string | null> {
  const database = await createPlayersDatabase();
  const leaseId = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + AVATAR_PREPARATION_LEASE_MS);

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
      const clearExpiredPreparation = database
        .delete(schema.avatarUploads)
        .where(
          and(
            eq(schema.avatarUploads.userId, userId),
            eq(schema.avatarUploads.state, PREPARING),
            lte(schema.avatarUploads.expiresAt, now),
          ),
        );
      const insertReservation = database
        .insert(schema.avatarUploads)
        .values({ userId, leaseId, state: PREPARING, expiresAt })
        .onConflictDoNothing()
        .returning({ leaseId: schema.avatarUploads.leaseId });
      const [, , reservations] = await database.batch([
        lockActiveUser,
        clearExpiredPreparation,
        insertReservation,
      ]);
      return reservations[0]?.leaseId ?? null;
    } catch (error: unknown) {
      if (isPostgresDivisionByZero(error) && (await isAccountDeletionPending(userId))) {
        return null;
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
    if (activeUser === undefined) return null;

    await transaction
      .delete(schema.avatarUploads)
      .where(
        and(
          eq(schema.avatarUploads.userId, userId),
          eq(schema.avatarUploads.state, PREPARING),
          lte(schema.avatarUploads.expiresAt, now),
        ),
      );
    const [reservation] = await transaction
      .insert(schema.avatarUploads)
      .values({ userId, leaseId, state: PREPARING, expiresAt })
      .onConflictDoNothing()
      .returning({ leaseId: schema.avatarUploads.leaseId });
    return reservation?.leaseId ?? null;
  });
}

export async function startAvatarUploadWrite(userId: string, leaseId: string): Promise<void> {
  const database = await createPlayersDatabase();
  const now = new Date();

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
      const activateWrite = database
        .update(schema.avatarUploads)
        .set({ state: WRITING, expiresAt: null })
        .where(
          and(
            eq(schema.avatarUploads.userId, userId),
            eq(schema.avatarUploads.leaseId, leaseId),
            eq(schema.avatarUploads.state, PREPARING),
            gt(schema.avatarUploads.expiresAt, now),
          ),
        )
        .returning({ leaseId: schema.avatarUploads.leaseId });
      const [, reservations] = await database.batch([lockActiveUser, activateWrite]);
      if (reservations.length === 0) {
        throw new AppError(
          "La reserva de subida expiró o la cuenta ya no está activa.",
          "CONFLICT",
        );
      }
      return;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      if (isPostgresDivisionByZero(error) && (await isAccountDeletionPending(userId))) {
        throw new AppError(
          "La cuenta ya no está activa o se encuentra en proceso de eliminación.",
          "CONFLICT",
        );
      }
      throw error;
    }
  }

  await database.transaction(async (transaction) => {
    const [activeUser] = await transaction
      .select({ id: authSchema.user.id })
      .from(authSchema.user)
      .where(and(eq(authSchema.user.id, userId), isNull(authSchema.user.deletedAt)))
      .for("update")
      .limit(1);
    if (activeUser === undefined) {
      throw new AppError(
        "La cuenta ya no está activa o se encuentra en proceso de eliminación.",
        "CONFLICT",
      );
    }

    const [reservation] = await transaction
      .update(schema.avatarUploads)
      .set({ state: WRITING, expiresAt: null })
      .where(
        and(
          eq(schema.avatarUploads.userId, userId),
          eq(schema.avatarUploads.leaseId, leaseId),
          eq(schema.avatarUploads.state, PREPARING),
          gt(schema.avatarUploads.expiresAt, now),
        ),
      )
      .returning({ leaseId: schema.avatarUploads.leaseId });
    if (reservation === undefined) {
      throw new AppError("La reserva de subida expiró; vuelve a seleccionar la foto.", "CONFLICT");
    }
  });
}

export async function finishAvatarUpload(userId: string, leaseId: string): Promise<void> {
  const database = await createPlayersDatabase();
  await database
    .delete(schema.avatarUploads)
    .where(and(eq(schema.avatarUploads.userId, userId), eq(schema.avatarUploads.leaseId, leaseId)));
  if (isPlaywrightE2E()) {
    try {
      const [reservation] = await database
        .select({ userId: schema.avatarUploads.userId })
        .from(schema.avatarUploads)
        .where(eq(schema.avatarUploads.userId, userId))
        .limit(1);
      if (reservation === undefined) {
        notifyE2EAvatarReservationReleased(userId);
      }
    } catch {
      // Diagnostic only: a failed E2E check must not turn a completed upload into an error.
    }
  }
}

export async function waitForAvatarUpload(userId: string): Promise<void> {
  const database = await createPlayersDatabase();
  const deadline = Date.now() + MAX_AVATAR_UPLOAD_WAIT_MS;
  let delayMs = INITIAL_POLL_DELAY_MS;

  while (true) {
    const now = new Date();
    if ("batch" in database) {
      const lockUser = database.execute(sql`
        SELECT ${authSchema.user.id}
        FROM ${authSchema.user}
        WHERE ${authSchema.user.id} = ${userId}
        FOR UPDATE
      `);
      const clearExpiredPreparation = database
        .delete(schema.avatarUploads)
        .where(
          and(
            eq(schema.avatarUploads.userId, userId),
            eq(schema.avatarUploads.state, PREPARING),
            lte(schema.avatarUploads.expiresAt, now),
          ),
        );
      await database.batch([lockUser, clearExpiredPreparation]);
    } else {
      await database.transaction(async (transaction) => {
        await transaction
          .select({ id: authSchema.user.id })
          .from(authSchema.user)
          .where(eq(authSchema.user.id, userId))
          .for("update")
          .limit(1);
        await transaction
          .delete(schema.avatarUploads)
          .where(
            and(
              eq(schema.avatarUploads.userId, userId),
              eq(schema.avatarUploads.state, PREPARING),
              lte(schema.avatarUploads.expiresAt, now),
            ),
          );
      });
    }

    const [reservation] = await database
      .select({ state: schema.avatarUploads.state })
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
