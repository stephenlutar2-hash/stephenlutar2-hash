import type { Request } from "express";

export interface AuthenticatedUser {
  username: string;
  role: string;
  authMethod: "entra" | "demo";
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
