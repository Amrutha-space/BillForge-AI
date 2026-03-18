import Link from "next/link";
import { FintechBackground } from "@/components/FintechBackground";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <FintechBackground />
      <Navbar showDashboard />

      <main className="relative mx-auto max-w-6xl px-4">
        <section className="pt-18 md:pt-24 pb-16">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Enterprise-grade billing automation
              </div>
              <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight">
                Billing, payments, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">AI risk</span> — unified.
              </h1>
              <p className="mt-4 text-white/70 leading-relaxed max-w-xl">
                SmartBill AI helps multi-tenant SaaS companies automate invoicing, collect payments with Stripe, and
                predict late-payment risk before it hits your cashflow.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button size="lg">Start free</Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="secondary">
                    View pricing
                  </Button>
                </Link>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-4 max-w-lg text-xs text-white/60">
                <div className="glass rounded-xl p-3 border border-white/10">
                  <div className="text-white font-medium">SOC2-ready</div>
                  <div className="mt-1">JWT + rate limits</div>
                </div>
                <div className="glass rounded-xl p-3 border border-white/10">
                  <div className="text-white font-medium">Stripe-native</div>
                  <div className="mt-1">Checkout flows</div>
                </div>
                <div className="glass rounded-xl p-3 border border-white/10">
                  <div className="text-white font-medium">AI insights</div>
                  <div className="mt-1">Risk scoring</div>
                </div>
              </div>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 border-b border-white/10">
                  <div className="text-sm text-white/70">Revenue overview</div>
                  <div className="mt-1 text-2xl font-semibold">$128,420</div>
                  <div className="mt-2 text-xs text-emerald-300">+14.2% MoM</div>
                </div>
                <div className="p-6 grid gap-4">
                  <div className="glass rounded-xl p-4">
                    <div className="text-xs text-white/60">Late payment risk</div>
                    <div className="mt-2 flex items-end justify-between">
                      <div className="text-lg font-semibold">0.23</div>
                      <div className="text-xs text-white/60">Low risk</div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-indigo-400 w-[23%]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-4">
                      <div className="text-xs text-white/60">Invoices sent</div>
                      <div className="mt-2 text-lg font-semibold">312</div>
                    </div>
                    <div className="glass rounded-xl p-4">
                      <div className="text-xs text-white/60">Paid on time</div>
                      <div className="mt-2 text-lg font-semibold">91.4%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="features" className="py-14 scroll-mt-20">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Built for fintech-grade operations</h2>
          <p className="mt-2 text-white/70 max-w-2xl">
            Multi-tenant isolation, secure auth, Stripe payments, subscription billing, and AI predictions with real
            observability.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { title: "Multi-tenant billing", desc: "Company-level data isolation with scoped APIs and analytics." },
              { title: "Stripe checkout", desc: "Invoice payments and SaaS subscriptions with secure redirects." },
              { title: "AI risk scoring", desc: "Predict late payments and prioritize collections proactively." },
              { title: "Analytics dashboard", desc: "Revenue, payments success rate, invoices volume and trends." },
              { title: "Admin-ready security", desc: "JWT auth, bcrypt, validation, and rate limiting by default." },
              { title: "Monitoring", desc: "Prometheus metrics + Grafana dashboards for reliability." }
            ].map((f) => (
              <Card key={f.title}>
                <CardContent>
                  <div className="text-white font-semibold">{f.title}</div>
                  <div className="mt-2 text-sm text-white/70">{f.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="how" className="py-14">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "Connect your company", desc: "Sign up and create a tenant (company) in seconds." },
              { step: "02", title: "Send invoices", desc: "Create invoices and share Stripe payment links." },
              { step: "03", title: "Predict & collect", desc: "AI flags late-risk invoices so you act earlier." }
            ].map((s) => (
              <Card key={s.step}>
                <CardContent>
                  <div className="text-xs text-white/60">{s.step}</div>
                  <div className="mt-2 text-white font-semibold">{s.title}</div>
                  <div className="mt-2 text-sm text-white/70">{s.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="pricing" className="py-14">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Pricing</h2>
              <p className="mt-2 text-white/70 max-w-2xl">Start small, scale to enterprise. Stripe checkout supported.</p>
            </div>
            <Link href="/pricing">
              <Button variant="secondary">Compare plans</Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { name: "Starter", price: "$29", desc: "Essentials for early-stage teams." },
              { name: "Pro", price: "$99", desc: "Advanced billing, analytics, and AI." },
              { name: "Enterprise", price: "Custom", desc: "Security, SLA, and scale." }
            ].map((p) => (
              <Card key={p.name} className={p.name === "Pro" ? "border border-indigo-400/30" : ""}>
                <CardContent>
                  <div className="text-white font-semibold">{p.name}</div>
                  <div className="mt-2 text-3xl font-semibold">{p.price}</div>
                  <div className="mt-2 text-sm text-white/70">{p.desc}</div>
                  <div className="mt-5">
                    <Link href="/pricing">
                      <Button className="w-full" variant={p.name === "Pro" ? "primary" : "secondary"}>
                        Choose {p.name}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-14 pb-20">
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <div className="text-2xl md:text-3xl font-semibold tracking-tight">Ready to automate billing?</div>
                </div>
                <Link href="/signup">
                  <Button size="lg">Create account</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <div className="mt-10 text-xs text-white/50">© {new Date().getFullYear()} BillForge AI - Built for Engineers to ENGINEER </div>
        </section>
      </main>
    </div>
  );
}

