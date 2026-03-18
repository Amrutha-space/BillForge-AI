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
  password: z.string().min(8),
  companyName: z.string().min(2),
  companySlug: z.string().min(2).regex(/^[a-z0-9-]+$/)
});

export default function SignupPage() {
  const router = useRouter();
  const signup = useMutation({
    mutationFn: async (payload: z.infer<typeof Schema>) => {
      const parsed = Schema.parse(payload);
      await api.post("/api/auth/signup", parsed);
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
              <div className="text-xl font-semibold">Create your tenant</div>
              <div className="mt-1 text-sm text-white/70">
                Set up a company and start sending invoices with Stripe payments.
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <form
                className="mt-4 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  signup.mutate({
                    email: String(fd.get("email")),
                    password: String(fd.get("password")),
                    companyName: String(fd.get("companyName")),
                    companySlug: String(fd.get("companySlug"))
                  });
                }}
              >
                <label className="grid gap-1 text-sm">
                  <span className="text-white/70">Company name</span>
                  <input
                    name="companyName"
                    required
                    className="h-11 rounded-xl bg-white/5 border border-white/10 px-3 outline-none focus:border-white/20"
                    placeholder="Acme Inc"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-white/70">Company slug</span>
                  <input
                    name="companySlug"
                    required
                    className="h-11 rounded-xl bg-white/5 border border-white/10 px-3 outline-none focus:border-white/20"
                    placeholder="acme-inc"
                    pattern="^[-a-z0-9]+$"
                    title="Only lowercase letters, numbers, and hyphens are allowed"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-white/70">Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="h-11 rounded-xl bg-white/5 border border-white/10 px-3 outline-none focus:border-white/20"
                    placeholder="you@acme.com"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-white/70">Password</span>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    className="h-11 rounded-xl bg-white/5 border border-white/10 px-3 outline-none focus:border-white/20"
                    placeholder="At least 8 characters"
                  />
                </label>

                <Button className="mt-2 w-full" disabled={signup.isPending} type="submit">
                  {signup.isPending ? "Creating..." : "Create account"}
                </Button>

                {signup.isError && <div className="text-sm text-red-300">Signup failed. Try a different email/slug.</div>}
              </form>

              <div className="mt-5 text-sm text-white/70">
                Already have an account?{" "}
                <Link href="/login" className="text-white underline">
                  Login
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

