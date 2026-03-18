"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Subscription = {
  id: string;
  plan: string;
  status: string;
  createdAt: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
};

export default function BillingPage() {
  const sub = useQuery({
    queryKey: ["subscription", "me"],
    queryFn: async () => (await api.get("/api/subscriptions/me")).data as Subscription | null
  });

  return (
    <Card>
      <CardHeader className="p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold">Billing</div>
          <div className="text-xs text-white/60 mt-1">Your current subscription plan and status.</div>
        </div>
        <Link href="/pricing">
          <Button variant="secondary">Change plan</Button>
        </Link>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {sub.data ? (
          <div className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4 border border-white/10">
                <div className="text-xs text-white/60">Plan</div>
                <div className="mt-1 text-white font-semibold">{sub.data.plan}</div>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10">
                <div className="text-xs text-white/60">Status</div>
                <div className="mt-1 text-white font-semibold">{sub.data.status}</div>
              </div>
            </div>
            <div className="text-white/60 text-xs">
              Created {new Date(sub.data.createdAt).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-white/70 text-sm">
            No subscription yet.{" "}
            <Link className="text-white underline" href="/pricing">
              Choose a plan
            </Link>
            .
          </div>
        )}
      </CardContent>
    </Card>
  );
}

