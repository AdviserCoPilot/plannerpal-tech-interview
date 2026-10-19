import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}

export class ValidationError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof ZodError) {
    const missing = err.issues
      .filter((i) => i.code === "invalid_type" && i.received === "undefined")
      .map((i) => i.path.join("."));
    const message = missing.length > 0
      ? `${missing.join(" and ")} required`
      : err.issues[0]?.message ?? "Invalid request";
    res.status(400).json({ error: message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
