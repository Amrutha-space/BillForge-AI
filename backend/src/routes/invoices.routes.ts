import { Router } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { requireAuth, requireCompanyContext, requireRole } from "../middleware/auth";
import { createInvoice, getInvoice, listInvoices } from "../services/invoices";
import { prisma } from "../config/prisma";
import { predictLatePayment } from "../services/ai";

export const invoicesRouter = Router();

/**
 * @openapi
 * /api/invoices:
 *   get:
 *     summary: List invoices for the current company
 *     tags: [Invoices]
 *     responses:
 *       200: { description: OK }
 */
invoicesRouter.get("/", requireAuth, requireCompanyContext, async (req, res, next) => {
  try {
    const invoices = await listInvoices(req.auth!.companyId!);
    res.json(invoices);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/invoices:
 *   post:
 *     summary: Create and send an invoice (company admin)
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerEmail, customerName, amountCents, dueDate]
 *             properties:
 *               customerEmail: { type: string }
 *               customerName: { type: string }
 *               amountCents: { type: integer }
 *               currency: { type: string }
 *               dueDate: { type: string }
 *     responses:
 *       201: { description: Created }
 */
invoicesRouter.post(
  "/",
  requireAuth,
  requireCompanyContext,
  requireRole(["COMPANY_ADMIN", "PLATFORM_ADMIN"]),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          customerEmail: z.string().email(),
          customerName: z.string().min(2),
          amountCents: z.number().int().positive(),
          currency: z.string().default("usd"),
          dueDate: z.string().datetime()
        })
        .parse(req.body);

      const invoice = await createInvoice({
        companyId: req.auth!.companyId!,
        customer: { email: body.customerEmail, name: body.customerName },
        amountCents: body.amountCents,
        currency: body.currency,
        dueDate: new Date(body.dueDate)
      });

      res.status(StatusCodes.CREATED).json(invoice);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /api/invoices/{id}:
 *   get:
 *     summary: Get an invoice by id
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
invoicesRouter.get("/:id", requireAuth, requireCompanyContext, async (req, res, next) => {
  try {
    const invoiceId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
    
    const invoice = await getInvoice(req.auth!.companyId!, invoiceId as string);
    res.json(invoice);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/invoices/{id}/predict:
 *   post:
 *     summary: Run late payment prediction for an invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
invoicesRouter.post(
  "/:id/predict",
  requireAuth,
  requireCompanyContext,
  requireRole(["COMPANY_ADMIN", "PLATFORM_ADMIN"]),
  async (req, res, next) => {
    try {
      const invoiceId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const invoice = await getInvoice(
        req.auth!.companyId!, 
        invoiceId as string
      );

      const customer_history = await prisma.invoice.count({
        where: { companyId: req.auth!.companyId!, customerId: invoice.customerId }
      });

      const previous_delays = await prisma.invoice.count({
        where: { companyId: req.auth!.companyId!, customerId: invoice.customerId, status: "OVERDUE" }
      });

      const ai = await predictLatePayment({
        invoice_amount: invoice.amountCents / 100,
        customer_history,
        previous_delays
      });

      const saved = await prisma.prediction.upsert({
        where: { invoiceId: invoice.id },
        update: {
          riskScore: ai.risk_score,
          delayProbability: ai.delay_probability,
          modelVersion: ai.model_version
        },
        create: {
          companyId: req.auth!.companyId!,
          invoiceId: invoice.id,
          riskScore: ai.risk_score,
          delayProbability: ai.delay_probability,
          modelVersion: ai.model_version
        }
      });

      res.json(saved);
    } catch (err) {
      next(err);
    }
  }
);

