import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BatteryCharging, Square, Zap } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBlock, LoadingBlock } from "@/components/States";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getBooking } from "@/services/bookings";
import {
  getSessionByBooking,
  startSession,
  stopSession,
  updateSessionProgress,
} from "@/services/charging";
import { INR, kwh } from "@/lib/format";

export const Route = createFileRoute("/_app/charging/$bookingId")({
  component: ChargingPage,
});

/** 1 simulated second = 1 simulated minute of charging. */
const TICK_MS = 1000;

function ChargingPage() {
  const { bookingId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const bookingQ = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBooking(bookingId),
  });
  const sessionQ = useQuery({
    queryKey: ["session", bookingId],
    queryFn: () => getSessionByBooking(bookingId),
  });

  const [running, setRunning] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [battery, setBattery] = useState(20);
  const [energy, setEnergy] = useState(0);
  const [busy, setBusy] = useState(false);
  const syncedAt = useRef(0);

  const booking = bookingQ.data;
  const session = sessionQ.data;
  const powerKw = Number(booking?.chargers?.power_kw ?? 0);
  const rate = Number(booking?.chargers?.price_per_kwh ?? 0);
  const cost = Number((energy * rate).toFixed(2));
  const completed = session?.status === "completed";

  useEffect(() => {
    if (session) {
      setBattery(session.current_battery);
      setEnergy(Number(session.energy_kwh));
      if (session.status === "active") setRunning(true);
    }
  }, [session?.id, session?.status]);

  useEffect(() => {
    if (!running || !session || completed) return;
    const id = setInterval(() => {
      setMinutes((m) => m + 1);
      setEnergy((e) => Number((e + powerKw / 60).toFixed(3)));
      setBattery((b) => Math.min(100, Number((b + powerKw / 30).toFixed(1))));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, session?.id, completed, powerKw]);

  // Persist progress roughly every 10 ticks.
  useEffect(() => {
    if (!session || !running || completed) return;
    if (minutes - syncedAt.current < 10) return;
    syncedAt.current = minutes;
    void updateSessionProgress(session.id, {
      current_battery: Math.round(battery),
      energy_kwh: Number(energy.toFixed(2)),
      cost: Number((energy * rate).toFixed(2)),
    });
  }, [minutes, session?.id, running, completed, battery, energy, rate]);

  useEffect(() => {
    if (running && battery >= 100) setRunning(false);
  }, [battery, running]);

  async function handleStart() {
    if (!user || !booking) return;
    setBusy(true);
    try {
      const s = await startSession({
        bookingId,
        userId: user.id,
        stationId: booking.station_id,
        chargerId: booking.charger_id,
        startBattery: Math.round(battery),
      });
      await queryClient.setQueryData(["session", bookingId], s);
      await sessionQ.refetch();
      setRunning(true);
      toast.success("Charging started");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start charging.");
    } finally {
      setBusy(false);
    }
  }

  async function handleStop() {
    if (!user || !booking || !session) return;
    setRunning(false);
    setBusy(true);
    try {
      await stopSession({
        sessionId: session.id,
        bookingId,
        chargerId: booking.charger_id,
        stationId: booking.station_id,
        userId: user.id,
        currentBattery: Math.round(battery),
        energyKwh: energy,
        ratePerKwh: rate,
      });
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Session complete — time to pay");
      navigate({ to: "/payment/$sessionId", params: { sessionId: session.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not stop the session.");
    } finally {
      setBusy(false);
    }
  }

  if (bookingQ.isLoading || sessionQ.isLoading) return <LoadingBlock label="Loading session…" />;
  if (bookingQ.error || !booking) return <ErrorBlock message="This booking could not be found." />;

  return (
    <PageTransition>
      <h1 className="font-display text-2xl font-bold">Charging session</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {booking.stations?.name} · {booking.chargers?.label} · {powerKw} kW
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="glass-glow flex flex-col items-center rounded-2xl p-8">
          <div className="relative flex size-44 items-center justify-center rounded-full border-4 border-border">
            <div
              className="absolute inset-0 rounded-full transition-all duration-500"
              style={{
                background: `conic-gradient(var(--color-primary) ${battery * 3.6}deg, transparent 0deg)`,
                opacity: 0.25,
              }}
            />
            <div className="relative text-center">
              <BatteryCharging
                className={`mx-auto size-7 text-primary ${running ? "animate-pulse" : ""}`}
              />
              <p className="mt-1 font-display text-3xl font-bold">{Math.round(battery)}%</p>
              <p className="text-xs text-muted-foreground">battery</p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            {!session || (session.status !== "active" && !completed) ? (
              <Button size="lg" disabled={busy} onClick={handleStart}>
                <Zap className="size-4" /> Start charging
              </Button>
            ) : completed ? (
              <Button size="lg" asChild>
                <Link to="/payment/$sessionId" params={{ sessionId: session.id }}>
                  Go to payment
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setRunning((r) => !r)}
                  disabled={busy}
                >
                  {running ? "Pause" : "Resume"}
                </Button>
                <Button size="lg" disabled={busy} onClick={handleStop}>
                  <Square className="size-4" /> Stop & pay
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="glass h-fit rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold">Live meter</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Elapsed" value={`${minutes} min`} />
            <Row label="Energy delivered" value={kwh(energy)} />
            <Row label="Rate" value={`${INR(rate)}/kWh`} />
            <Row label="Running cost" value={INR(cost)} />
            <Row
              label="Status"
              value={completed ? "Completed" : running ? "Charging" : session ? "Paused" : "Idle"}
            />
          </dl>
        </div>
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
