import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BatteryCharging, CalendarClock, Plug } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBlock, LoadingBlock } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getStation } from "@/services/stations";
import { listVehicles } from "@/services/profile";
import { BookingConflictError, createBooking, quoteBooking } from "@/services/bookings";
import { CHARGER_TYPE_LABEL, SERVICE_FEE } from "@/services/types";
import { INR, kwh, minutesToLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/booking/$stationId")({
  component: BookingPage,
});

const DURATIONS = [30, 45, 60, 90, 120];

function defaultStart() {
  const d = new Date(Date.now() + 15 * 60_000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function BookingPage() {
  const { stationId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const stationQ = useQuery({
    queryKey: ["station", stationId],
    queryFn: () => getStation(stationId),
  });
  const vehiclesQ = useQuery({
    queryKey: ["vehicles", user?.id],
    queryFn: () => listVehicles(user!.id),
    enabled: !!user?.id,
  });

  const [chargerId, setChargerId] = useState<string | null>(null);
  const [startAt, setStartAt] = useState(defaultStart);
  const [duration, setDuration] = useState(60);
  const [saving, setSaving] = useState(false);

  const chargers = stationQ.data?.chargers ?? [];
  const selected = useMemo(
    () =>
      chargers.find((c) => c.id === chargerId) ??
      chargers.find((c) => c.status === "available") ??
      null,
    [chargers, chargerId],
  );
  const quote = selected ? quoteBooking(selected, duration) : null;

  async function handleBook() {
    if (!user || !selected) return;
    const start = new Date(startAt);
    if (Number.isNaN(start.getTime())) {
      toast.error("Pick a valid start time.");
      return;
    }
    if (start.getTime() < Date.now() - 60_000) {
      toast.error("Start time must be in the future.");
      return;
    }
    setSaving(true);
    try {
      const primary = (vehiclesQ.data ?? []).find((v) => v.is_primary) ?? vehiclesQ.data?.[0];
      const booking = await createBooking({
        userId: user.id,
        stationId,
        charger: selected,
        vehicleId: primary?.id ?? null,
        startTime: start,
        durationMinutes: duration,
      });
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Slot booked!");
      navigate({ to: "/confirmation/$bookingId", params: { bookingId: booking.id } });
    } catch (err) {
      if (err instanceof BookingConflictError) toast.error(err.message);
      else toast.error(err instanceof Error ? err.message : "Could not create booking.");
    } finally {
      setSaving(false);
    }
  }

  if (stationQ.isLoading) return <LoadingBlock label="Loading station…" />;
  if (stationQ.error || !stationQ.data)
    return <ErrorBlock message="This station could not be found." />;

  return (
    <PageTransition>
      <Link
        to="/stations/$stationId"
        params={{ stationId }}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to station
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold">Book a charging slot</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {stationQ.data.name} · {stationQ.data.address}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="glass rounded-2xl p-5">
            <h2 className="font-display text-base font-semibold">1. Choose a charger</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {chargers.map((c) => {
                const disabled = c.status !== "available";
                const active = selected?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setChargerId(c.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40",
                      disabled && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <p className="font-semibold">{c.label}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Plug className="size-3.5" /> {CHARGER_TYPE_LABEL[c.charger_type]} ·{" "}
                      {c.power_kw} kW · {INR(Number(c.price_per_kwh))}/kWh
                    </p>
                    {disabled && (
                      <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                        Unavailable
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="glass rounded-2xl p-5">
            <h2 className="font-display text-base font-semibold">2. Pick your slot</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="start">Start time</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Duration</Label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                        duration === d
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      {minutesToLabel(d)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="glass h-fit rounded-2xl p-5">
          <h2 className="font-display text-base font-semibold">Booking summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Charger" value={selected?.label ?? "—"} />
            <Row label="Duration" value={minutesToLabel(duration)} />
            <Row label="Estimated energy" value={quote ? kwh(quote.energy) : "—"} />
            <Row label="Energy cost" value={quote ? INR(quote.cost) : "—"} />
            <Row label="Service fee" value={INR(SERVICE_FEE)} />
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Estimated total</span>
            <span className="font-display text-xl font-bold text-primary">
              {quote ? INR(quote.cost + SERVICE_FEE) : "—"}
            </span>
          </div>
          <Button
            className="mt-5 w-full"
            size="lg"
            disabled={!selected || saving}
            onClick={handleBook}
          >
            {saving ? (
              <>
                <CalendarClock className="size-4" /> Booking…
              </>
            ) : (
              <>
                <BatteryCharging className="size-4" /> Confirm booking
              </>
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Payment is collected after your charging session ends.
          </p>
        </aside>
      </div>
    </PageTransition>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
