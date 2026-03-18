"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { FintechBackground } from "@/components/FintechBackground";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { api } from "@/lib/api";

type Plan = "Starter" | "Pro" | "Enterprise";

export default function PricingPage() {
  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/api/auth/me")).data,
    retry: false
  });

  const checkout = useMutation({
    mutationFn: async (plan: Plan) => {
      const resp = await api.post("/api/subscriptions/checkout", { plan });
      return resp.data as { url: string };
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    }
  });

  const plans: { plan: Plan; price: string; highlight?: boolean; bullets: string[] }[] = [
    { plan: "Starter", price: "$29/mo", bullets: ["Invoices + payments", "Basic analytics", "Email receipts"] },
    {
      plan: "Pro",
      price: "$99/mo",
      highlight: true,
      bullets: ["Subscriptions", "AI late-payment risk", "Advanced analytics", "Priority support"]
    },
    { plan: "Enterprise", price: "Custom", bullets: ["SLA", "SSO-ready patterns", "Dedicated support", "Custom limits"] }
  ];

  return (
    <div className="relative min-h-screen">
      <FintechBackground />
      <Navbar showDashboard />

      <main className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Transparent pricing for modern billing</h1>
          <p className="mt-3 text-white/70">
            Choose a plan and checkout with Stripe. After subscribing, you’ll see billing status inside the dashboard.
          </p>
          {!me.isSuccess && (
            <div className="mt-5 text-sm text-white/70">
              To subscribe you must be logged in.{" "}
              <Link className="underline text-white" href="/login">
                Login
              </Link>
              .
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.plan} className={p.highlight ? "border border-indigo-400/30" : ""}>
              <CardHeader className="p-6">
                <div className="text-white font-semibold">{p.plan}</div>
                <div className="mt-2 text-3xl font-semibold">{p.price}</div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-emerald-300">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button
                    className="w-full"
                    variant={p.highlight ? "primary" : "secondary"}
                    disabled={!me.isSuccess || checkout.isPending}
                    onClick={() => checkout.mutate(p.plan)}
                  >
                    {me.isSuccess ? `Checkout ${p.plan}` : "Login to subscribe"}
                  </Button>
                  {checkout.isError && <div className="mt-3 text-xs text-red-300">Checkout failed.</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

