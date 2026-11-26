import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import * as authSchema from "../src/lib/db/auth-schema";
import { createLocalDatabase, closeLocalDatabase } from "../src/lib/db/pglite";
import { createDatabase } from "../src/lib/db";
import { assertEligibleForAdminPromotion } from "../src/modules/auth/domain/roles";
import * as playerSchema from "../src/modules/players/infra/schema";

const databaseSchema = { ...authSchema, ...playerSchema };

async function promoteAdmin(): Promise<void> {
  const args = process.argv.slice(2);
  const proofOption = z.enum(["--credential-reset", "--identity-confirmed"]).safeParse(args[1]);
  const emailArgument = args[0];
  const parsedEmail = z.string().email().safeParse(emailArgument?.trim());
  if (args.length !== 2 || !proofOption.success || !parsedEmail.success) {
    throw new Error("Uso: pnpm admin:promote <correo> --credential-reset|--identity-confirmed");
  }

  const email = parsedEmail.data.toLocaleLowerCase("en-US");
  const isLocalDatabase = process.env.DATABASE_URL === undefined;
  const database = isLocalDatabase
    ? await createLocalDatabase(databaseSchema)
    : await createDatabase(databaseSchema);

  try {
    const [user] = await database
      .select({
        id: authSchema.user.id,
        email: authSchema.user.email,
        emailVerified: authSchema.user.emailVerified,
        role: authSchema.user.role,
        deletedAt: authSchema.user.deletedAt,
      })
      .from(authSchema.user)
      .where(sql`lower(${authSchema.user.email}) = ${email}`)
      .limit(1);

    assertEligibleForAdminPromotion(user);
    if (user.role === "admin") {
      console.info(`La cuenta ${user.email} ya tiene el rol admin.`);
      return;
    }

    const updatedUsers = await database
      .update(authSchema.user)
      .set({ role: "admin", updatedAt: new Date() })
      .where(
        and(
          eq(authSchema.user.id, user.id),
          eq(authSchema.user.emailVerified, true),
          isNull(authSchema.user.deletedAt),
        ),
      )
      .returning();
    if (updatedUsers.length === 0) {
      throw new Error("La cuenta cambió de estado; vuelve a verificarla antes de promoverla.");
    }

    console.info(
      `Rol actualizado: ${user.email} (${user.role} → admin); prueba declarada: ${proofOption.data}.`,
    );
  } finally {
    if (isLocalDatabase) {
      await closeLocalDatabase();
    }
  }
}

try {
  await promoteAdmin();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : "No se pudo promover la cuenta.");
  process.exitCode = 1;
}
