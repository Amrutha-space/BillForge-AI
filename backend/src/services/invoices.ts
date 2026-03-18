import { prisma } from "../config/prisma";
import { HttpError } from "../utils/httpError";
import { StatusCodes } from "http-status-codes";
import { randomUUID } from "crypto";

export async function createInvoice(params: {
  companyId: string;
  customer: { email: string; name: string };
  amountCents: number;
  currency: string;
  dueDate: Date;
}) {
  const customer = await prisma.customer.upsert({
    where: { companyId_email: { companyId: params.companyId, email: params.customer.email } },
    update: { name: params.customer.name },
    create: { companyId: params.companyId, email: params.customer.email, name: params.customer.name }
  });

  const invoice = await prisma.invoice.create({
    data: {
      invoiceId: `inv_${randomUUID().replaceAll("-", "")}`,
      companyId: params.companyId,
      customerId: customer.id,
      amountCents: params.amountCents,
      currency: params.currency,
      dueDate: params.dueDate,
      status: "SENT"
    },
    include: { customer: true }
  });

  return invoice;
}

export async function listInvoices(companyId: string) {
  return prisma.invoice.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: { customer: true, payments: true, prediction: true }
  });
}

export async function getInvoice(companyId: string, invoiceId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { companyId, id: invoiceId },
    include: { customer: true, payments: true, prediction: true }
  });
  if (!invoice) throw new HttpError("Invoice not found", StatusCodes.NOT_FOUND);
  return invoice;
}

