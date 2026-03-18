"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const nav = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" }
];

export function Navbar({ showDashboard }: { showDashboard?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 backdrop-blur border-b border-white/10 bg-black/20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400" />
            </div>
            <span className="font-semibold tracking-tight">BillForge AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "hover:text-white transition",
                  pathname === n.href ? "text-white" : "text-white/80"
                )}
              >
                {n.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            {showDashboard ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="sm">Get started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

