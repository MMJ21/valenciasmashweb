export { AuthConfigurationError, getAuth } from "./infra/auth";
export { hashPassword, verifyPasswordHash } from "./infra/password-hasher";
export { assertEligibleForAdminPromotion, resolveInitialRole, USER_ROLES } from "./domain/roles";
export type { UserRole } from "./domain/roles";
export { PRIVACY_DRAFT_VERSION, TERMS_VERSION } from "./domain/legal-versions";
