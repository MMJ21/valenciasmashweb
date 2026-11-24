import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { username } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { env } from "@/lib/config/env";
import * as authSchema from "@/lib/db/auth-schema";
import { createPlayersDatabase } from "@/modules/players/infra/database";
import * as playerSchema from "@/modules/players/infra/schema";
import { resolveInitialRole } from "../domain/roles";
import { sendTransactionalEmail } from "./email-sender";
import { hashPassword, verifyPasswordHash } from "./password-hasher";

const schema = { ...authSchema, ...playerSchema };
const localSecret = "valenciasmash-local-auth-secret-only-not-for-production";
const adminEmails = new Set(
  env.ADMIN_EMAILS.split(",")
    .map((email) => email.trim().toLocaleLowerCase("en-US"))
    .filter((email) => email.length > 0),
);

function createAuth() {
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
        },
        deleteUser: {
          enabled: true,
          beforeDelete: async (deletedUser) => {
            const database = await createPlayersDatabase();
            await database
              .update(playerSchema.players)
              .set({
                userId: null,
                gamertag: null,
                firstName: null,
                lastName: null,
                twitter: null,
                twitch: null,
                avatarUrl: null,
                bio: null,
              })
              .where(eq(playerSchema.players.userId, deletedUser.id));
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
                  role: resolveInitialRole(newUser.email, adminEmails),
                },
              };
            },
            after: async (newUser) => {
              const db = await createPlayersDatabase();
              await db
                .insert(playerSchema.players)
                .values({ userId: newUser.id })
                .onConflictDoNothing();
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
          "/sign-up/email": { window: 60, max: 3 },
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
  authPromise ??= createAuth();
  return authPromise;
}
