export interface ErrorResponseBody {
  status: number;
  code: string;
  message: string;
  requestId?: string;
  timestamp: string;
  details?: string;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: string;

  constructor(status: number, code: string, message: string, details?: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: string): AppError {
    return new AppError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Insufficient permissions", details?: string): AppError {
    return new AppError(403, "FORBIDDEN", message, details);
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, "CONFLICT", message);
  }

  static serviceUnavailable(message = "Service unavailable"): AppError {
    return new AppError(503, "SERVICE_UNAVAILABLE", message);
  }

  static internal(message = "Internal server error"): AppError {
    return new AppError(500, "INTERNAL_ERROR", message);
  }

  toResponseBody(requestId?: string): ErrorResponseBody {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      ...(requestId && { requestId }),
      timestamp: new Date().toISOString(),
      ...(this.details && { details: this.details }),
    };
  }
}

export function formatErrorResponse(
  status: number,
  code: string,
  message: string,
  requestId?: string,
  details?: string,
): ErrorResponseBody {
  return {
    status,
    code,
    message,
    ...(requestId && { requestId }),
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };
}
