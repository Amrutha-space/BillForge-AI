import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireCompanyContext } from "../middleware/auth";
import { prisma } from "../config/prisma";
import { createSubscriptionCheckout } from "../services/stripeCheckout";

export const subscriptionsRouter = Router();

/**
 * @openapi
 * /api/subscriptions/me:
 *   get:
 *     summary: Get current company's latest subscription
 *     tags: [Subscriptions]
 *     responses:
 *       200: { description: OK }
 */
subscriptionsRouter.get("/me", requireAuth, requireCompanyContext, async (req, res, next) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { companyId: req.auth!.companyId! },
      orderBy: { createdAt: "desc" }
    });
    res.json(sub);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/subscriptions/checkout:
 *   post:
 *     summary: Create a Stripe Checkout session for SaaS subscription
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan]
 *             properties:
 *               plan: { type: string, enum: [Starter, Pro, Enterprise] }
 *     responses:
 *       200: { description: OK }
 */
subscriptionsRouter.post("/checkout", requireAuth, requireCompanyContext, async (req, res, next) => {
  try {
    const body = z.object({ plan: z.enum(["Starter", "Pro", "Enterprise"]) }).parse(req.body);
    const result = await createSubscriptionCheckout({ companyId: req.auth!.companyId!, plan: body.plan });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

