import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";
import { sanitizeString } from "../lib/sanitize";
import { formatErrorResponse } from "../lib/errors";

function getRequestId(req: Request): string | undefined {
  return (req as any).id as string | undefined;
}

function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "body";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

function sanitizeDeep(value: unknown): unknown {
  if (typeof value === "string") {
    return sanitizeString(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeDeep);
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = sanitizeDeep(v);
    }
    return result;
  }
  return value;
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = formatZodError(result.error);
      res.status(400).json(
        formatErrorResponse(400, "VALIDATION_ERROR", "Validation failed", getRequestId(req), details),
      );
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateAndSanitizeBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = formatZodError(result.error);
      res.status(400).json(
        formatErrorResponse(400, "VALIDATION_ERROR", "Validation failed", getRequestId(req), details),
      );
      return;
    }
    req.body = sanitizeDeep(result.data);
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const details = formatZodError(result.error);
      res.status(400).json(
        formatErrorResponse(400, "VALIDATION_ERROR", "Query validation failed", getRequestId(req), details),
      );
      return;
    }
    (req as Request & { validatedQuery: unknown }).validatedQuery = result.data;
    next();
  };
}
