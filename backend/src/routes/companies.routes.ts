import { Router } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma";
import { requireAuth, requireCompanyContext, requireRole } from "../middleware/auth";

export const companiesRouter = Router();

/**
 * @openapi
 * /api/companies/me:
 *   get:
 *     summary: Get current company details
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: OK
 */
companiesRouter.get("/me", requireAuth, requireCompanyContext, async (req, res, next) => {
  try {
    const company = await prisma.company.findUniqueOrThrow({ where: { id: req.auth!.companyId! } });
    res.json({ id: company.id, name: company.name, slug: company.slug });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/companies/users:
 *   post:
 *     summary: Create a user under the current company (company admin only)
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, role]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [COMPANY_ADMIN, CUSTOMER] }
 *     responses:
 *       201:
 *         description: Created
 */
companiesRouter.post(
  "/users",
  requireAuth,
  requireCompanyContext,
  requireRole(["COMPANY_ADMIN", "PLATFORM_ADMIN"]),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          email: z.string().email(),
          password: z.string().min(8),
          role: z.enum(["COMPANY_ADMIN", "CUSTOMER"])
        })
        .parse(req.body);

      const user = await prisma.user.create({
        data: {
          email: body.email,
          passwordHash: await (await import("../services/password")).hashPassword(body.password),
          role: body.role,
          companyId: req.auth!.companyId!
        },
        select: { id: true, email: true, role: true, companyId: true }
      });

      res.status(StatusCodes.CREATED).json(user);
    } catch (err) {
      next(err);
    }
  }
);

