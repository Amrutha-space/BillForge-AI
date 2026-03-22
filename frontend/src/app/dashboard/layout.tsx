"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, clearAccessToken } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/payments", label: "Payments" },
  { href: "/dashboard/billing", label: "Billing" }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/api/auth/me")).data,
    retry: false
  });

  React.useEffect(() => {
    if (me.isError) router.replace("/login");
  }, [me.isError, router]);

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">
            BillForge AI
          </Link>
          <div className="flex items-center gap-2">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.post("/api/auth/logout");
                clearAccessToken();
                router.replace("/login");
              }}
            >
              <Button size="sm" variant="secondary" type="submit">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="glass rounded-2xl border border-white/10 p-3 h-fit">
          <div className="px-3 py-2 text-xs text-white/60">Navigation</div>
          <nav className="grid gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm transition",
                  pathname === n.href ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/8 hover:text-white"
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 px-3 py-2 text-xs text-white/60">
            {me.isSuccess ? (
              <div>
                <div className="text-white/80">Role</div>
                <div className="text-white">{me.data.role}</div>
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
