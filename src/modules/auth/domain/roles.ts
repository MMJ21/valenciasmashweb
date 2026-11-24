export const USER_ROLES = ["user", "importer", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function resolveInitialRole(
  email: string,
  configuredAdminEmails: ReadonlySet<string>,
): UserRole {
  return configuredAdminEmails.has(email.trim().toLocaleLowerCase("en-US")) ? "admin" : "user";
}
