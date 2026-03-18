"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api";
import { FintechBackground } from "@/components/FintechBackground";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export default function LoginPage() {
  const router = useRouter();
  const login = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const parsed = Schema.parse(payload);
      await api.post("/api/auth/login", parsed);
    },
    onSuccess: () => router.push("/dashboard")
  });

  return (
    <div className="relative min-h-screen">
      <FintechBackground />
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="p-6">
              <div className="text-xl font-semibold">Welcome back</div>
              <div className="mt-1 text-sm text-white/70">Login to manage invoices and revenue analytics.</div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <form
                className="mt-4 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  login.mutate({ email: String(fd.get("email")), password: String(fd.get("password")) });
                }}
              >
                <label className="grid gap-1 text-sm">
                  <span className="text-white/70">Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="h-11 rounded-xl bg-white/5 border border-white/10 px-3 outline-none focus:border-white/20"
                    placeholder="you@company.com"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-white/70">Password</span>
                  <input
                    name="password"
                    type="password"
                    required
                    className="h-11 rounded-xl bg-white/5 border border-white/10 px-3 outline-none focus:border-white/20"
                    placeholder="••••••••"
                  />
                </label>

                <Button className="mt-2 w-full" disabled={login.isPending} type="submit">
                  {login.isPending ? "Signing in..." : "Sign in"}
                </Button>

                {login.isError && <div className="text-sm text-red-300">Invalid credentials.</div>}
              </form>

              <div className="mt-5 text-sm text-white/70">
                New here?{" "}
                <Link href="/signup" className="text-white underline">
                  Create an account
                </Link>
                .
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

