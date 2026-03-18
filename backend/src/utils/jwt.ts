import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { UserRole } from "@prisma/client";

export type AccessTokenClaims = {
  sub: string;
  role: UserRole;
  companyId?: string | null;
};

export function signAccessToken(claims: AccessTokenClaims): string {
  return jwt.sign(claims, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_TTL_SECONDS });
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token");
  }
  const { sub, role, companyId } = decoded as Record<string, unknown>;
  if (typeof sub !== "string" || typeof role !== "string") {
    throw new Error("Invalid token claims");
  }
  return { sub, role: role as UserRole, companyId: (companyId as string | null | undefined) ?? null };
}

