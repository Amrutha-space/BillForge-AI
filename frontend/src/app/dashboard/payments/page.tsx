"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type Payment = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
  invoice?: { invoiceId: string } | null;
};

export default function PaymentsPage() {
  const payments = useQuery({
    queryKey: ["payments"],
    queryFn: async () => (await api.get("/api/payments")).data as Payment[]
  });

  return (
    <Card>
      <CardHeader className="p-5">
        <div className="text-sm font-semibold">Payments</div>
        <div className="text-xs text-white/60 mt-1">Payment history and Stripe checkout states.</div>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-3 font-medium">Created</th>
                <th className="text-left py-3 pr-3 font-medium">Invoice</th>
                <th className="text-left py-3 pr-3 font-medium">Amount</th>
                <th className="text-left py-3 pr-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(payments.data ?? []).map((p) => (
                <tr key={p.id} className="border-b border-white/10">
                  <td className="py-3 pr-3">{new Date(p.createdAt).toLocaleString()}</td>
                  <td className="py-3 pr-3">{p.invoice?.invoiceId ?? "—"}</td>
                  <td className="py-3 pr-3">
                    ${(p.amountCents / 100).toFixed(2)} {p.currency.toUpperCase()}
                  </td>
                  <td className="py-3 pr-3">{p.status}</td>
                </tr>
              ))}
              {(payments.data ?? []).length === 0 && (
                <tr>
                  <td className="py-6 text-white/60" colSpan={4}>
                    No payments yet.
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

