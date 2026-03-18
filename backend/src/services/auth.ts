import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma";
import { hashPassword, verifyPassword } from "./password";
import { signAccessToken } from "../utils/jwt";
import { HttpError } from "../utils/httpError";
import type { UserRole } from "@prisma/client";

export async function signup(params: {
  email: string;
  password: string;
  companyName: string;
  companySlug: string;
}): Promise<{ accessToken: string }> {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) throw new HttpError("Email already in use", StatusCodes.CONFLICT);

  const company = await prisma.company.create({
    data: {
      name: params.companyName,
      slug: params.companySlug
    }
  });

  const user = await prisma.user.create({
    data: {
      email: params.email,
      passwordHash: await hashPassword(params.password),
      role: "COMPANY_ADMIN",
      companyId: company.id
    }
  });

  return { accessToken: signAccessToken({ sub: user.id, role: user.role, companyId: user.companyId }) };
}

export async function login(params: { email: string; password: string }): Promise<{ accessToken: string }> {
  const user = await prisma.user.findUnique({ where: { email: params.email } });
  if (!user) throw new HttpError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  const ok = await verifyPassword(params.password, user.passwordHash);
  if (!ok) throw new HttpError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  return { accessToken: signAccessToken({ sub: user.id, role: user.role, companyId: user.companyId }) };
}

export async function createUser(params: {
  companyId: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<{ id: string; email: string; role: UserRole }> {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) throw new HttpError("Email already in use", StatusCodes.CONFLICT);

  const user = await prisma.user.create({
    data: {
      email: params.email,
      passwordHash: await hashPassword(params.password),
      role: params.role,
      companyId: params.companyId
    }
  });
  return { id: user.id, email: user.email, role: user.role };
}

