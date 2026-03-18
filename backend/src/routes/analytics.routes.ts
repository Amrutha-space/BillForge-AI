import { Router } from "express";
import { requireAuth, requireCompanyContext } from "../middleware/auth";
import { prisma } from "../config/prisma";

export const analyticsRouter = Router();

/**
 * @openapi
 * /api/analytics/summary:
 *   get:
 *     summary: Get revenue, payment success rate, prediction stats, monthly invoice counts
 *     tags: [Analytics]
 *     responses:
 *       200: { description: OK }
 */
analyticsRouter.get("/summary", requireAuth, requireCompanyContext, async (req, res, next) => {
  try {
    const companyId = req.auth!.companyId!;

    const payments = await prisma.payment.findMany({
      where: { companyId },
      select: { amountCents: true, status: true, createdAt: true }
    });

    const revenueCents = payments.filter((p) => p.status === "SUCCEEDED").reduce((sum, p) => sum + p.amountCents, 0);
    const totalPayments = payments.length;
    const successfulPayments = payments.filter((p) => p.status === "SUCCEEDED").length;
    const paymentSuccessRate = totalPayments === 0 ? 0 : successfulPayments / totalPayments;

    const predictions = await prisma.prediction.findMany({
      where: { companyId },
      select: { riskScore: true, delayProbability: true, createdAt: true }
    });
    const avgRiskScore =
      predictions.length === 0 ? 0 : predictions.reduce((s, p) => s + p.riskScore, 0) / predictions.length;
    const avgDelayProbability =
      predictions.length === 0
        ? 0
        : predictions.reduce((s, p) => s + p.delayProbability, 0) / predictions.length;

    const invoices = await prisma.invoice.findMany({
      where: { companyId },
      select: { createdAt: true, status: true, amountCents: true }
    });

    const now = new Date();
    const monthBuckets: { month: string; invoiceCount: number; amountCents: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      monthBuckets.push({ month: key, invoiceCount: 0, amountCents: 0 });
    }
    for (const inv of invoices) {
      const key = `${inv.createdAt.getUTCFullYear()}-${String(inv.createdAt.getUTCMonth() + 1).padStart(2, "0")}`;
      const bucket = monthBuckets.find((b) => b.month === key);
      if (bucket) {
        bucket.invoiceCount += 1;
        bucket.amountCents += inv.amountCents;
      }
    }

    res.json({
      revenueCents,
      paymentSuccessRate,
      predictions: { count: predictions.length, avgRiskScore, avgDelayProbability },
      monthlyInvoices: monthBuckets
    });
  } catch (err) {
    next(err);
  }
});

