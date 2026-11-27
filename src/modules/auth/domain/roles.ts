export const USER_ROLES = ["user", "importer", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function resolveInitialRole(): UserRole {
  return "user";
}

export interface AdminPromotionCandidate {
  readonly emailVerified: boolean;
  readonly deletedAt: Date | null;
}

export function assertEligibleForAdminPromotion(
  user: AdminPromotionCandidate | undefined,
): asserts user is AdminPromotionCandidate {
  if (user === undefined) {
    throw new Error("No existe una cuenta con ese correo.");
  }
  if (!user.emailVerified) {
    throw new Error("La cuenta debe verificar su correo antes de recibir el rol admin.");
  }
  if (user.deletedAt !== null) {
    throw new Error("No se puede promover una cuenta en proceso de eliminación.");
  }
}
