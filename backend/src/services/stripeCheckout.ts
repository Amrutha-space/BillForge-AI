import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { getStripeClient } from "../config/stripe";
import { HttpError } from "../utils/httpError";
import { stripeFailuresTotal } from "../observability/metrics";

function ensureStripeConfigured() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new HttpError("Stripe is not configured", StatusCodes.PRECONDITION_FAILED, {
      missing: ["STRIPE_SECRET_KEY"]
    });
  }
}

export async function createInvoicePaymentCheckout(params: {
  companyId: string;
  invoiceId: string;
}): Promise<{ url: string }> {
  ensureStripeConfigured();
  const stripe = getStripeClient();

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.invoiceId, companyId: params.companyId },
    include: { customer: true, company: true }
  });
  if (!invoice) throw new HttpError("Invoice not found", StatusCodes.NOT_FOUND);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${env.FRONTEND_URL}/dashboard/payments?success=1`,
      cancel_url: `${env.FRONTEND_URL}/dashboard/invoices/${invoice.id}?canceled=1`,
      customer_email: invoice.customer.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: invoice.currency,
            unit_amount: invoice.amountCents,
            product_data: {
              name: `Invoice ${invoice.invoiceId}`,
              description: `Payment to ${invoice.company.name}`
            }
          }
        }
      ],
      metadata: {
        companyId: invoice.companyId,
        invoiceId: invoice.id,
        invoicePublicId: invoice.invoiceId
      }
    });

    await prisma.payment.create({
      data: {
        companyId: invoice.companyId,
        invoiceId: invoice.id,
        amountCents: invoice.amountCents,
        currency: invoice.currency,
        status: "REQUIRES_ACTION",
        stripeCheckoutSessionId: session.id
      }
    });

    if (!session.url) throw new HttpError("Stripe session missing url", StatusCodes.BAD_GATEWAY);
    return { url: session.url };
  } catch (err) {
    stripeFailuresTotal.labels("create_invoice_payment_checkout").inc();
    throw err;
  }
}

export async function createSubscriptionCheckout(params: {
  companyId: string;
  plan: "Starter" | "Pro" | "Enterprise";
}): Promise<{ url: string }> {
  ensureStripeConfigured();
  const stripe = getStripeClient();

  const company = await prisma.company.findUnique({ where: { id: params.companyId } });
  if (!company) throw new HttpError("Company not found", StatusCodes.NOT_FOUND);

  const priceId =
    params.plan === "Starter"
      ? env.STRIPE_STARTER_PRICE_ID
      : params.plan === "Pro"
        ? env.STRIPE_PRO_PRICE_ID
        : env.STRIPE_ENTERPRISE_PRICE_ID;

console.log("PLAN:", params.plan);
console.log("PRICE ID:", priceId);

  if (!priceId) {
    throw new HttpError("Stripe price is not configured for plan", StatusCodes.PRECONDITION_FAILED, {
      plan: params.plan,
      missingEnv:
        params.plan === "Starter"
          ? "STRIPE_STARTER_PRICE_ID"
          : params.plan === "Pro"
            ? "STRIPE_PRO_PRICE_ID"
            : "STRIPE_ENTERPRISE_PRICE_ID"
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${env.FRONTEND_URL}/dashboard/billing?success=1`,
      cancel_url: `${env.FRONTEND_URL}/pricing?canceled=1`,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { companyId: company.id, plan: params.plan }
    });

    await prisma.subscription.create({
      data: {
        companyId: company.id,
        plan: params.plan,
        status: "INCOMPLETE",
        stripePriceId: priceId,
        stripeCheckoutSessionId: session.id
      }
    });

    if (!session.url) throw new HttpError("Stripe session missing url", StatusCodes.BAD_GATEWAY);
    return { url: session.url };
  } catch (err) {
    stripeFailuresTotal.labels("create_subscription_checkout").inc();
    throw err;
  }
}

