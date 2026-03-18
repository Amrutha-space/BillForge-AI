"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type AnalyticsSummary = {
  revenueCents: number;
  paymentSuccessRate: number;
  predictions: { count: number; avgRiskScore: number; avgDelayProbability: number };
  monthlyInvoices: { month: string; invoiceCount: number; amountCents: number }[];
};

type Invoice = {
  id: string;
  invoiceId: string;
  amountCents: number;
  currency: string;
  dueDate: string;
  status: string;
  customer: { name: string; email: string };
  prediction?: { riskScore: number; delayProbability: number } | null;
};

export default function DashboardOverview() {
  const qc = useQueryClient();

  const summary = useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: async () => (await api.get("/api/analytics/summary")).data as AnalyticsSummary
  });

  const invoices = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => (await api.get("/api/invoices")).data as Invoice[]
  });

  const createSampleInvoice = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const due = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 10);
      const resp = await api.post("/api/invoices", {
        customerEmail: "customer@example.com",
        customerName: "Example Customer",
        amountCents: 12900,
        currency: "usd",
        dueDate: due.toISOString()
      });
      return resp.data as Invoice;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["invoices"] });
      await qc.invalidateQueries({ queryKey: ["analytics", "summary"] });
    }
  });

  const runPrediction = useMutation({
    mutationFn: async (invoiceId: string) => {
      const resp = await api.post(`/api/invoices/${invoiceId}/predict`);
      return resp.data as unknown;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["invoices"] });
      await qc.invalidateQueries({ queryKey: ["analytics", "summary"] });
    }
  });

  const monthly = (summary.data?.monthlyInvoices ?? []).map((m) => ({
    month: m.month,
    invoices: m.invoiceCount,
    amount: Math.round(m.amountCents / 100)
  }));

  const revenue = summary.data ? (summary.data.revenueCents / 100).toFixed(2) : "0.00";
  const successRate = summary.data ? Math.round(summary.data.paymentSuccessRate * 100) : 0;

  const highRisk = (invoices.data ?? []).filter((i) => (i.prediction?.delayProbability ?? 0) >= 0.6);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-white/70 text-sm">Dashboard</div>
          <div className="text-2xl md:text-3xl font-semibold tracking-tight">Revenue & Risk Insights</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => createSampleInvoice.mutate()} disabled={createSampleInvoice.isPending}>
            Create sample invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="p-5">
            <div className="text-xs text-white/60">Revenue</div>
            <div className="mt-1 text-xl font-semibold">${revenue}</div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-xs text-white/60">Succeeded payments total</CardContent>
        </Card>
        <Card>
          <CardHeader className="p-5">
            <div className="text-xs text-white/60">Payment success rate</div>
            <div className="mt-1 text-xl font-semibold">{successRate}%</div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-xs text-white/60">Succeeded / total</CardContent>
        </Card>
        <Card>
          <CardHeader className="p-5">
            <div className="text-xs text-white/60">Avg risk score</div>
            <div className="mt-1 text-xl font-semibold">{(summary.data?.predictions.avgRiskScore ?? 0).toFixed(2)}</div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-xs text-white/60">Across predicted invoices</CardContent>
        </Card>
        <Card>
          <CardHeader className="p-5">
            <div className="text-xs text-white/60">High-risk invoices</div>
            <div className="mt-1 text-xl font-semibold">{highRisk.length}</div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-xs text-white/60">Delay probability ≥ 0.60</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="p-5">
            <div className="text-sm font-semibold">Monthly invoices</div>
            <div className="text-xs text-white/60 mt-1">Volume over the last 6 months</div>
          </CardHeader>
          <CardContent className="p-5 pt-0 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.55)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.55)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "rgba(10, 10, 25, 0.9)", border: "1px solid rgba(255,255,255,0.12)" }} />
                <Bar dataKey="invoices" fill="rgba(99,102,241,0.75)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5">
            <div className="text-sm font-semibold">Invoice amount trend</div>
            <div className="text-xs text-white/60 mt-1">Total billed per month (USD)</div>
          </CardHeader>
          <CardContent className="p-5 pt-0 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.55)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.55)" fontSize={12} />
                <Tooltip contentStyle={{ background: "rgba(10, 10, 25, 0.9)", border: "1px solid rgba(255,255,255,0.12)" }} />
                <Line type="monotone" dataKey="amount" stroke="rgba(236,72,153,0.85)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-5">
          <div className="text-sm font-semibold">Late payment prediction insights</div>
          <div className="text-xs text-white/60 mt-1">Run predictions to triage collections</div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 pr-3 font-medium">Invoice</th>
                  <th className="text-left py-3 pr-3 font-medium">Customer</th>
                  <th className="text-left py-3 pr-3 font-medium">Amount</th>
                  <th className="text-left py-3 pr-3 font-medium">Status</th>
                  <th className="text-left py-3 pr-3 font-medium">Delay probability</th>
                  <th className="text-right py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {(invoices.data ?? []).slice(0, 8).map((inv) => (
                  <tr key={inv.id} className="border-b border-white/10">
                    <td className="py-3 pr-3">{inv.invoiceId}</td>
                    <td className="py-3 pr-3">{inv.customer.name}</td>
                    <td className="py-3 pr-3">
                      ${(inv.amountCents / 100).toFixed(2)} {inv.currency.toUpperCase()}
                    </td>
                    <td className="py-3 pr-3">{inv.status}</td>
                    <td className="py-3 pr-3">
                      {inv.prediction ? (inv.prediction.delayProbability * 100).toFixed(1) + "%" : "—"}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={runPrediction.isPending}
                        onClick={() => runPrediction.mutate(inv.id)}
                      >
                        Predict
                      </Button>
                    </td>
                  </tr>
                ))}
                {(invoices.data ?? []).length === 0 && (
                  <tr>
                    <td className="py-6 text-white/60" colSpan={6}>
                      No invoices yet. Create a sample invoice to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

