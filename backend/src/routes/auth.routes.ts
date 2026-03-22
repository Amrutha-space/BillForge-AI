import { Router } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env";
import { signup, login } from "../services/auth";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

function getAuthCookieOptions() {
  const isProduction = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    secure: isProduction,
    maxAge: env.JWT_ACCESS_TTL_SECONDS * 1000,
    path: "/"
  };
}

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Create a company and company admin user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, companyName, companySlug]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               companyName: { type: string }
 *               companySlug: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
authRouter.post("/signup", async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        companyName: z.string().min(2),
        companySlug: z.string().min(2).regex(/^[a-z0-9-]+$/)
      })
      .parse(req.body);

    const result = await signup(body);
    res
      .cookie("access_token", result.accessToken, getAuthCookieOptions())
      .status(StatusCodes.OK)
      .json({ accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login with email/password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
authRouter.post("/login", async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(1)
      })
      .parse(req.body);

    const result = await login(body);
    res
      .cookie("access_token", result.accessToken, getAuthCookieOptions())
      .status(StatusCodes.OK)
      .json({ accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout (clears cookie)
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: No Content
 */
authRouter.post("/logout", (_req, res) => {
  res.clearCookie("access_token", getAuthCookieOptions()).status(StatusCodes.NO_CONTENT).send();
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user claims
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 */
authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({ userId: req.auth!.userId, role: req.auth!.role, companyId: req.auth!.companyId ?? null });
});
