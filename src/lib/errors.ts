export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; code: string; message: string };

export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function failure(code: string, message: string): ActionResult<never> {
  return { success: false, code, message };
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}
