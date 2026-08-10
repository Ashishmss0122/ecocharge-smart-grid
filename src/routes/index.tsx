import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BatteryCharging, Building2, Gauge, Leaf, MapPinned, QrCode, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoCharge — Smart EV Charging Station Management" },
      {
        name: "description",
        content:
          "Find EV chargers across Hyderabad, book a slot, track live charging and pay in seconds. EcoCharge also gives station owners full operational analytics.",
      },
      { property: "og:title", content: "EcoCharge — Smart EV Charging Station Management" },
      {
        property: "og:description",
        content: "Discover, book and track EV charging with real-time availability.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: MapPinned, title: "Smart discovery", text: "Live availability, distance, pricing and wait time across every station." },
  { icon: QrCode, title: "QR-verified booking", text: "Reserve a charger and arrive with a scannable confirmation code." },
  { icon: BatteryCharging, title: "Live session tracking", text: "Watch battery, energy and cost update second by second." },
  { icon: Gauge, title: "Smart recommendations", text: "A scoring engine ranks stations on distance, speed, price and queue." },
  { icon: Building2, title: "Owner console", text: "Manage stations, chargers, pricing and revenue analytics." },
  { icon: ShieldCheck, title: "Role-based access", text: "Drivers, owners and administrators each get a tailored workspace." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="grid-glow absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary"
          >
            <Leaf className="size-3.5" /> Powering clean mobility in Hyderabad
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl"
          >
            Charge smarter with the{" "}
            <span className="text-primary">EcoCharge</span> network
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            Real-time charger availability, one-tap slot booking, QR check-in, live session
            tracking and instant payments — plus a full analytics console for station owners.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-9 flex flex-wrap justify-center gap-3"
          >
            <Button size="lg" asChild>
              <Link to="/stations">
                <Zap className="size-4" /> Find a charging station
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/register">List your station</Link>
            </Button>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["5+", "Live stations"],
              ["24/7", "Availability"],
              ["120 kW", "Peak charging"],
              ["<60s", "Booking time"],
            ].map(([value, label]) => (
              <div key={label} className="glass rounded-2xl px-4 py-5">
                <p className="font-display text-2xl font-bold text-primary">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-bold">Everything the charging journey needs</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            One platform for drivers, station owners and platform administrators.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.05}>
              <div className="glass h-full rounded-2xl p-6 transition-transform hover:-translate-y-1">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/12 ring-1 ring-primary/25">
                  <Icon className="size-5 text-primary" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <Reveal>
          <div className="glass-glow rounded-3xl px-8 py-14 text-center">
            <h2 className="font-display text-3xl font-bold">Ready to plug in?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Create an account in seconds and book your first charging slot today.
            </p>
            <Button size="lg" className="mt-7" asChild>
              <Link to="/register">Create free account</Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <Logo />
          <p>© {new Date().getFullYear()} EcoCharge. Built for a greener commute.</p>
        </div>
      </footer>
    </div>
  );
}
