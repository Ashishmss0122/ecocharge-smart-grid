import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BatteryCharging, CalendarClock, MapPinned, Wallet } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { StatCard } from "@/components/StatCard";
import { EmptyState, LoadingBlock } from "@/components/States";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listBookings } from "@/services/bookings";
import { listPayments } from "@/services/payments";
import { formatDateTime, INR } from "@/lib/format";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profile } = useAuth();
  const uid = user?.id ?? "";

  const bookingsQ = useQuery({
    queryKey: ["bookings", uid],
    queryFn: () => listBookings(uid),
    enabled: !!uid,
  });
  const paymentsQ = useQuery({
    queryKey: ["payments", uid],
    queryFn: () => listPayments(uid),
    enabled: !!uid,
  });

  const bookings = bookingsQ.data ?? [];
  const upcoming = bookings.filter((b) => b.status === "confirmed" || b.status === "active");
  const spend = (paymentsQ.data ?? [])
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + Number(p.total_amount), 0);

  return (
    <PageTransition>
      <h1 className="font-display text-2xl font-bold">
        Hello{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Here's your charging snapshot.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarClock} label="Upcoming bookings" value={upcoming.length} />
        <StatCard icon={BatteryCharging} label="Total bookings" value={bookings.length} />
        <StatCard icon={Wallet} label="Total spend" value={INR(spend)} />
        <StatCard
          icon={MapPinned}
          label="Completed sessions"
          value={bookings.filter((b) => b.status === "completed").length}
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Upcoming bookings</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/stations">Book a charger</Link>
          </Button>
        </div>

        {bookingsQ.isLoading ? (
          <LoadingBlock />
        ) : upcoming.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={CalendarClock}
              title="No upcoming bookings"
              description="Find a nearby station and reserve a charging slot."
              action={
                <Button asChild>
                  <Link to="/stations">Find stations</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
              >
                <div>
                  <p className="font-semibold">{b.stations?.name ?? "Station"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(b.start_time)} · {b.chargers?.label ?? "Charger"}
                  </p>
                </div>
                <Button size="sm" asChild>
                  <Link to="/charging/$bookingId" params={{ bookingId: b.id }}>Charge now</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageTransition>
  );
}
