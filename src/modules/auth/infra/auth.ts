import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { username } from "better-auth/plugins";
import { eq, inArray, sql } from "drizzle-orm";
import { env } from "@/lib/config/env";
import * as authSchema from "@/lib/db/auth-schema";
import { ensurePlayerForUser, waitForAvatarUpload } from "@/modules/players";
import { createPlayersDatabase } from "@/modules/players/infra/database";
import * as playerSchema from "@/modules/players/infra/schema";
import { resolveInitialRole } from "../domain/roles";
import { TERMS_VERSION } from "../domain/legal-versions";
import { sendTransactionalEmail } from "./email-sender";
import { hashPassword, verifyPasswordHash } from "./password-hasher";
import { deleteAvatar } from "@/modules/players/infra/avatar-storage";

const schema = { ...authSchema, ...playerSchema };
const localSecret = "valenciasmash-local-auth-secret-only-not-for-production";
export class AuthConfigurationError extends Error {
  constructor() {
    super("La autenticación no está configurada en el servidor.");
    this.name = "AuthConfigurationError";
  }
}

const anonymizedPlayerFields = {
  startggPlayerId: null,
  startggSlug: null,
  gamertag: null,
  firstName: null,
  lastName: null,
  twitter: null,
  twitch: null,
  avatarUrl: null,
  bio: null,
};

async function prepareAccountDeletion(userId: string): Promise<void> {
  const database = await createPlayersDatabase();
  const lockUser = database.execute(sql`
    SELECT 1 / COUNT(*)
    FROM (
      SELECT ${authSchema.user.id}
      FROM ${authSchema.user}
      WHERE ${authSchema.user.id} = ${userId}
      FOR UPDATE
    ) AS locked_user
  `);
  const markDeleted = database
    .update(authSchema.user)
    .set({ deletedAt: sql`COALESCE(${authSchema.user.deletedAt}, now())` })
    .where(eq(authSchema.user.id, userId));

  if ("batch" in database) {
    await database.batch([lockUser, markDeleted]);
  } else {
    await database.transaction(async (transaction) => {
      const [existingUser] = await transaction
        .select({ id: authSchema.user.id })
        .from(authSchema.user)
        .where(eq(authSchema.user.id, userId))
        .for("update")
        .limit(1);
      if (existingUser === undefined) {
        throw new APIError("NOT_FOUND", { message: "No se encontró la cuenta." });
      }

      await transaction
        .update(authSchema.user)
        .set({ deletedAt: sql`COALESCE(${authSchema.user.deletedAt}, now())` })
        .where(eq(authSchema.user.id, userId));
    });
  }

  await waitForAvatarUpload(userId);
  await deleteAvatar(userId);

  const anonymizePlayer = database
    .update(playerSchema.players)
    .set(anonymizedPlayerFields)
    .where(eq(playerSchema.players.userId, userId));
  const deletePlayerCharacters = database
    .delete(playerSchema.playerCharacters)
    .where(
      inArray(
        playerSchema.playerCharacters.playerId,
        database
          .select({ id: playerSchema.players.id })
          .from(playerSchema.players)
          .where(eq(playerSchema.players.userId, userId)),
      ),
    );

  if ("batch" in database) {
    await database.batch([anonymizePlayer, deletePlayerCharacters]);
    return;
  }

  await database.transaction(async (transaction) => {
    await transaction
      .update(playerSchema.players)
      .set(anonymizedPlayerFields)
      .where(eq(playerSchema.players.userId, userId));
    await transaction
      .delete(playerSchema.playerCharacters)
      .where(
        inArray(
          playerSchema.playerCharacters.playerId,
          transaction
            .select({ id: playerSchema.players.id })
            .from(playerSchema.players)
            .where(eq(playerSchema.players.userId, userId)),
        ),
      );
  });
}

function createAuth() {
  if (
    process.env.NODE_ENV === "production" &&
    (env.BETTER_AUTH_SECRET === undefined ||
      env.BETTER_AUTH_URL === undefined ||
      env.RESEND_API_KEY === undefined ||
      env.EMAIL_FROM === undefined)
  ) {
    throw new AuthConfigurationError();
  }

  return createPlayersDatabase().then((database) =>
    betterAuth({
      appName: "ValenciaSmash",
      baseURL: env.BETTER_AUTH_URL ?? "http://localhost:3000",
      secret: env.BETTER_AUTH_SECRET ?? localSecret,
      database: drizzleAdapter(database, {
        provider: "pg",
        schema,
      }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        autoSignIn: false,
        minPasswordLength: 12,
        maxPasswordLength: 128,
        revokeSessionsOnPasswordReset: true,
        password: {
          hash: hashPassword,
          verify: verifyPasswordHash,
        },
        sendResetPassword: async ({ user, url }) => {
          await sendTransactionalEmail({
            to: user.email,
            subject: "Restablece tu contraseña de ValenciaSmash",
            text: "Hemos recibido una solicitud para restablecer tu contraseña.",
            actionUrl: url,
            actionLabel: "Restablecer contraseña",
          });
        },
      },
      emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
        expiresIn: 60 * 60 * 24,
        sendVerificationEmail: async ({ user, url }) => {
          await sendTransactionalEmail({
            to: user.email,
            subject: "Verifica tu correo de ValenciaSmash",
            text: "Confirma tu dirección de correo para activar tu cuenta.",
            actionUrl: url,
            actionLabel: "Verificar correo",
          });
        },
      },
      user: {
        additionalFields: {
          role: {
            type: ["user", "importer", "admin"],
            required: false,
            defaultValue: "user",
            input: false,
          },
          deletedAt: {
            type: "date",
            required: false,
            input: false,
          },
          adultConfirmed: { type: "boolean", required: true },
          termsAccepted: { type: "boolean", required: true },
          termsAcceptedAt: { type: "date", required: false, input: false },
          termsVersion: { type: "string", required: false, input: false },
        },
        deleteUser: {
          enabled: true,
          beforeDelete: async (deletedUser) => {
            await prepareAccountDeletion(deletedUser.id);
          },
        },
      },
      databaseHooks: {
        user: {
          create: {
            before: async (newUser) => {
              if (!newUser.adultConfirmed || !newUser.termsAccepted) {
                throw new APIError("BAD_REQUEST", {
                  message: "Debes confirmar que eres mayor de edad y aceptar los términos.",
                });
              }
              return {
                data: {
                  ...newUser,
                  role: resolveInitialRole(),
                  termsAcceptedAt: new Date(),
                  termsVersion: TERMS_VERSION,
                },
              };
            },
            after: async (newUser) => {
              await ensurePlayerForUser(newUser.id);
            },
          },
        },
        session: {
          create: {
            after: async (newSession) => {
              await ensurePlayerForUser(newSession.userId);
            },
          },
        },
      },
      plugins: [username({ minUsernameLength: 3, maxUsernameLength: 32 })],
      advanced: {
        database: { generateId: "uuid" },
        defaultCookieAttributes: {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        },
      },
      rateLimit: {
        enabled: true,
        window: 60,
        max: 10,
        storage: process.env.NODE_ENV === "development" ? "memory" : "database",
        customRules: {
          "/sign-up/email": {
            window: 60,
            max:
              process.env.NODE_ENV === "development" && process.env.PLAYWRIGHT_TEST === "true"
                ? 10
                : 3,
          },
          "/send-verification-email": { window: 3600, max: 3 },
          "/request-password-reset": { window: 3600, max: 3 },
          "/sign-in/username": { window: 60, max: 10 },
        },
      },
    }),
  );
}

export type ValenciaAuth = Awaited<ReturnType<typeof createAuth>>;

let authPromise: Promise<ValenciaAuth> | undefined;

export function getAuth(): Promise<ValenciaAuth> {
  authPromise ??= createAuth().catch((error: unknown) => {
    authPromise = undefined;
    throw error;
  });
  return authPromise;
}
