import { Router } from "express";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { getStripeClient } from "../config/stripe";
import { stripeFailuresTotal } from "../observability/metrics";

export const stripeWebhookRouter = Router();

// Stripe requires the raw body to verify signatures.
stripeWebhookRouter.post(
  "/stripe",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async (req: Request, res: Response) => {
    if (!env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_SECRET_KEY) {
      return res.status(StatusCodes.PRECONDITION_FAILED).json({ error: { message: "Stripe webhook not configured" } });
    }

    const stripe = getStripeClient();
    const sig = req.headers["stripe-signature"];
    if (!sig || typeof sig !== "string") return res.status(StatusCodes.BAD_REQUEST).send("Missing signature");

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(req.body as any, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      stripeFailuresTotal.labels("webhook_signature").inc();
      return res.status(StatusCodes.BAD_REQUEST).send("Invalid signature");
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as { id: string; mode: "payment" | "subscription"; subscription?: string };

        const payment = await prisma.payment.findFirst({
          where: { stripeCheckoutSessionId: session.id },
          include: { invoice: true }
        });

        if (session.mode === "payment" && payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "SUCCEEDED" }
          });
          if (payment.invoiceId) {
            await prisma.invoice.update({
              where: { id: payment.invoiceId },
              data: { status: "PAID" }
            });
          }
        }

        if (session.mode === "subscription") {
          const sub = await prisma.subscription.findFirst({ where: { stripeCheckoutSessionId: session.id } });
          if (sub) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: "ACTIVE", stripeSubscriptionId: session.subscription ?? null }
            });
          }
        }
      }

      return res.status(StatusCodes.OK).json({ received: true });
    } catch (err) {
      stripeFailuresTotal.labels("webhook_handler").inc();
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: { message: "Webhook handler failed" } });
    }
  }
);

