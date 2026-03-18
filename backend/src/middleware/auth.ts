import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyAccessToken } from "../utils/jwt";
import { HttpError } from "../utils/httpError";
import type { UserRole } from "@prisma/client";

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  const cookieToken = (req.cookies?.access_token as string | undefined) ?? undefined;
  return cookieToken ?? null;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next(new HttpError("Unauthorized", StatusCodes.UNAUTHORIZED));
  try {
    const claims = verifyAccessToken(token);
    req.auth = { userId: claims.sub, role: claims.role, companyId: claims.companyId ?? null };
    return next();
  } catch {
    return next(new HttpError("Unauthorized", StatusCodes.UNAUTHORIZED));
  }
}

export function requireRole(allowed: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new HttpError("Unauthorized", StatusCodes.UNAUTHORIZED));
    if (!allowed.includes(req.auth.role)) return next(new HttpError("Forbidden", StatusCodes.FORBIDDEN));
    return next();
  };
}

export function requireCompanyContext(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) return next(new HttpError("Unauthorized", StatusCodes.UNAUTHORIZED));
  if (!req.auth.companyId) return next(new HttpError("Company context required", StatusCodes.BAD_REQUEST));
  return next();
}

