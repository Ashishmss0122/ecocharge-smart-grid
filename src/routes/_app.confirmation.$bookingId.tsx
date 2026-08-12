import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2 } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBlock, LoadingBlock } from "@/components/States";
import { Button } from "@/components/ui/button";
import { getBooking } from "@/services/bookings";
import { formatDateTime, INR, kwh, minutesToLabel, shortId } from "@/lib/format";

export const Route = createFileRoute("/_app/confirmation/$bookingId")({
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { bookingId } = Route.useParams();
  const bookingQ = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBooking(bookingId),
  });

  if (bookingQ.isLoading) return <LoadingBlock label="Loading your ticket…" />;
  if (bookingQ.error || !bookingQ.data)
    return <ErrorBlock message="This booking could not be found." />;

  const b = bookingQ.data;

  return (
    <PageTransition>
      <div className="mx-auto max-w-xl">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="size-12 text-primary" />
          <h1 className="mt-3 font-display text-2xl font-bold">Booking confirmed</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Show this ticket at the station to unlock your charger.
          </p>
        </div>

        <div className="glass-glow mt-6 rounded-2xl p-6">
          <div className="flex flex-col items-center">
            <div className="rounded-xl bg-white p-3">
              <QRCodeSVG value={`ECOCHARGE:${b.id}`} size={148} />
            </div>
            <p className="mt-3 font-mono text-sm tracking-wider text-primary">{shortId(b.id)}</p>
          </div>

          <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
            <Row label="Station" value={b.stations?.name ?? "Station"} />
            <Row label="Charger" value={b.chargers?.label ?? "Charger"} />
            <Row label="Starts" value={formatDateTime(b.start_time)} />
            <Row label="Duration" value={minutesToLabel(b.duration_minutes)} />
            <Row label="Estimated energy" value={kwh(Number(b.estimated_energy_kwh))} />
            <Row label="Estimated cost" value={INR(Number(b.estimated_cost))} />
            <Row label="Status" value={b.status} />
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" className="flex-1">
            <Link to="/charging/$bookingId" params={{ bookingId: b.id }}>
              Start charging
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link to="/history">View history</Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}
