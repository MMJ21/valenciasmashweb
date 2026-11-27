export function isPostgresDivisionByZero(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "22012";
}

export function isPostgresForeignKeyViolation(error: unknown, constraint: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23503" &&
    "constraint" in error &&
    error.constraint === constraint
  );
}
