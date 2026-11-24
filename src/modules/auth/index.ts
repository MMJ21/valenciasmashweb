export { getAuth } from "./infra/auth";
export { hashPassword, verifyPasswordHash } from "./infra/password-hasher";
export { resolveInitialRole, USER_ROLES } from "./domain/roles";
export type { UserRole } from "./domain/roles";
