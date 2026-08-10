import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { EmptyState, LoadingBlock } from "@/components/States";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listBookings } from "@/services/bookings";
import { formatDateTime, INR, minutesToLabel } from "@/lib/format";

export const Route = createFileRoute("/_app/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const bookingsQ = useQuery({
    queryKey: ["bookings", uid],
    queryFn: () => listBookings(uid),
    enabled: !!uid,
  });

  const bookings = bookingsQ.data ?? [];

  return (
    <PageTransition>
      <h1 className="font-display text-2xl font-bold">Booking & charging history</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every reservation, session and payment in one place.
      </p>

      {bookingsQ.isLoading ? (
        <LoadingBlock />
      ) : bookings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Clock}
            title="No history yet"
            description="Once you book a charging slot it will appear here."
            action={
              <Button asChild>
                <Link to="/stations">Find stations</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="glass rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{b.stations?.name ?? "Station"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(b.start_time)} · {minutesToLabel(b.duration_minutes)} ·{" "}
                    {b.chargers?.label ?? "Charger"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    {INR(Number(b.estimated_cost ?? 0))}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {b.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
