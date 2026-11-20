export type AppErrorCode = "VALIDATION" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT";

export class AppError extends Error {
  constructor(
    message: string,
    readonly code: AppErrorCode,
  ) {
    super(message);
    this.name = "AppError";
  }
}
