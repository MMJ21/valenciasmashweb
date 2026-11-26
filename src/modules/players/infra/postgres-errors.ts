export function isPostgresDivisionByZero(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "22012";
}
