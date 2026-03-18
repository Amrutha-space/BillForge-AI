import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireCompanyContext } from "../middleware/auth";
import { prisma } from "../config/prisma";
import { createInvoicePaymentCheckout } from "../services/stripeCheckout";

export const paymentsRouter = Router();

/**
 * @openapi
 * /api/payments:
 *   get:
 *     summary: List payments for the current company
 *     tags: [Payments]
 *     responses:
 *       200: { description: OK }
 */
paymentsRouter.get("/", requireAuth, requireCompanyContext, async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { companyId: req.auth!.companyId! },
      orderBy: { createdAt: "desc" },
      include: { invoice: true }
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/payments/checkout:
 *   post:
 *     summary: Create a Stripe Checkout session to pay an invoice
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invoiceId]
 *             properties:
 *               invoiceId: { type: string }
 *     responses:
 *       200: { description: OK }
 */
paymentsRouter.post("/checkout", requireAuth, requireCompanyContext, async (req, res, next) => {
  try {
    const body = z.object({ invoiceId: z.string().min(1) }).parse(req.body);
    const result = await createInvoicePaymentCheckout({ companyId: req.auth!.companyId!, invoiceId: body.invoiceId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

