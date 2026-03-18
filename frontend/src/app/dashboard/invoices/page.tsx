"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Invoice = {
  id: string;
  invoiceId: string;
  amountCents: number;
  currency: string;
  dueDate: string;
  status: string;
  customer: { name: string; email: string };
};

export default function InvoicesPage() {
  const qc = useQueryClient();
  const invoices = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => (await api.get("/api/invoices")).data as Invoice[]
  });

  const pay = useMutation({
    mutationFn: async (invoiceId: string) => {
      const resp = await api.post("/api/payments/checkout", { invoiceId });
      return resp.data as { url: string };
    },
    onSuccess: (data) => (window.location.href = data.url)
  });

  const create = useMutation({
    mutationFn: async () => {
      const due = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
      await api.post("/api/invoices", {
        customerEmail: `buyer+${Math.floor(Math.random() * 9999)}@example.com`,
        customerName: "Buyer",
        amountCents: 4999,
        currency: "usd",
        dueDate: due
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["invoices"] });
      await qc.invalidateQueries({ queryKey: ["analytics", "summary"] });
    }
  });

  return (
    <Card>
      <CardHeader className="p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold">Invoices</div>
          <div className="text-xs text-white/60 mt-1">Create invoices and collect payments via Stripe Checkout.</div>
        </div>
        <Button variant="secondary" onClick={() => create.mutate()} disabled={create.isPending}>
          Create invoice
        </Button>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-3 font-medium">Invoice</th>
                <th className="text-left py-3 pr-3 font-medium">Customer</th>
                <th className="text-left py-3 pr-3 font-medium">Amount</th>
                <th className="text-left py-3 pr-3 font-medium">Due</th>
                <th className="text-left py-3 pr-3 font-medium">Status</th>
                <th className="text-right py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {(invoices.data ?? []).map((inv) => (
                <tr key={inv.id} className="border-b border-white/10">
                  <td className="py-3 pr-3">{inv.invoiceId}</td>
                  <td className="py-3 pr-3">{inv.customer.email}</td>
                  <td className="py-3 pr-3">
                    ${(inv.amountCents / 100).toFixed(2)} {inv.currency.toUpperCase()}
                  </td>
                  <td className="py-3 pr-3">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="py-3 pr-3">{inv.status}</td>
                  <td className="py-3 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => pay.mutate(inv.id)}
                      disabled={pay.isPending}
                    >
                      Pay
                    </Button>
                  </td>
                </tr>
              ))}
              {(invoices.data ?? []).length === 0 && (
                <tr>
                  <td className="py-6 text-white/60" colSpan={6}>
                    No invoices yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

