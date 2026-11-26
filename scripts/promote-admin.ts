import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import * as authSchema from "../src/lib/db/auth-schema";
import { createLocalDatabase, closeLocalDatabase } from "../src/lib/db/pglite";
import { createDatabase } from "../src/lib/db";
import { assertEligibleForAdminPromotion } from "../src/modules/auth/domain/roles";
import * as playerSchema from "../src/modules/players/infra/schema";

const databaseSchema = { ...authSchema, ...playerSchema };

async function promoteAdmin(): Promise<void> {
  const parsedEmail = z.string().email().safeParse(process.argv[2]?.trim());
  if (!parsedEmail.success || process.argv.length > 3) {
    throw new Error("Uso: pnpm admin:promote <correo-verificado>");
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

    await database
      .update(authSchema.user)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(authSchema.user.id, user.id));

    console.info(`Rol actualizado: ${user.email} (${user.role} → admin).`);
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
