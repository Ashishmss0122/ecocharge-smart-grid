import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Navigation } from "lucide-react";
import { boundsOf, projectToBox } from "@/lib/geo";
import { INR, km } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { StationInsight } from "@/lib/recommend";
import type { StationWithChargers } from "@/services/types";
import { cn } from "@/lib/utils";

type Entry = { station: StationWithChargers; insight: StationInsight };

/**
 * Coordinate-driven map-style visualisation.
 * Positions come from real lat/lng, so swapping in Google Maps later means
 * replacing this component only — the data contract stays identical.
 */
export function StationMap({ entries }: { entries: Entry[] }) {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.station.id ?? null);

  const points = useMemo(
    () =>
      entries.map((e) => ({
        lat: Number(e.station.latitude),
        lng: Number(e.station.longitude),
      })),
    [entries],
  );
  const bounds = useMemo(() => boundsOf(points), [points]);
  const active = entries.find((e) => e.station.id === activeId) ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div className="glass grid-glow relative min-h-[420px] overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            color: "var(--color-muted-foreground)",
          }}
          aria-hidden
        />
        {entries.map(({ station, insight }) => {
          const pos = projectToBox(
            { lat: Number(station.latitude), lng: Number(station.longitude) },
            bounds,
          );
          const isActive = station.id === activeId;
          return (
            <button
              key={station.id}
              type="button"
              onClick={() => setActiveId(station.id)}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              aria-label={station.name}
            >
              <span
                className={cn(
                  "relative grid size-9 place-items-center rounded-full transition-all",
                  isActive
                    ? "scale-125 bg-primary text-primary-foreground shadow-[0_0_0_6px_color-mix(in_oklab,var(--primary)_22%,transparent)]"
                    : insight.availableChargers > 0
                      ? "bg-accent/85 text-accent-foreground hover:scale-110"
                      : "bg-muted text-muted-foreground hover:scale-110",
                )}
              >
                <MapPin className="size-4" />
              </span>
              <span className="mt-1 block max-w-24 truncate text-center text-[10px] font-medium text-muted-foreground">
                {station.name.split(" ")[0]}
              </span>
            </button>
          );
        })}

        <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl bg-background/70 px-3 py-2 text-[11px] text-muted-foreground backdrop-blur">
          <p className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-accent" /> Chargers available
          </p>
          <p className="mt-1 flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-muted" /> Currently full
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        {active ? (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Selected station
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold">{active.station.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{active.station.address}</p>

            <dl className="mt-5 space-y-3 text-sm">
              <Row label="Distance" value={km(active.insight.distanceKm)} />
              <Row
                label="Availability"
                value={`${active.insight.availableChargers} of ${active.insight.totalChargers} free`}
              />
              <Row label="From" value={`${INR(active.insight.minPrice)}/kWh`} />
              <Row label="Fastest charger" value={`${active.insight.maxPowerKw} kW`} />
              <Row label="Rating" value={`${Number(active.station.rating).toFixed(1)} ★`} />
            </dl>

            <div className="mt-6 flex flex-col gap-2">
              <Button asChild>
                <Link to="/stations/$stationId" params={{ stationId: active.station.id }}>
                  View station details
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${active.station.latitude},${active.station.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation className="size-4" /> Directions
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a pin to see station details.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
