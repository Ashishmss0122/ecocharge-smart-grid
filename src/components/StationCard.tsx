import { Link } from "@tanstack/react-router";
import { Gauge, MapPin, Plug, Star, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INR, km } from "@/lib/format";
import { recommendationVerdict, waitLabel, type StationInsight } from "@/lib/recommend";
import type { StationWithChargers } from "@/services/types";
import { cn } from "@/lib/utils";

export function StationCard({
  station,
  insight,
  highlight = false,
}: {
  station: StationWithChargers;
  insight: StationInsight;
  highlight?: boolean;
}) {
  return (
    <article
      className={cn(
        "group flex flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1",
        highlight ? "glass-glow" : "glass hover:border-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {highlight && (
            <span className="mb-2 inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              {recommendationVerdict(insight.score)}
            </span>
          )}
          <h3 className="truncate font-display text-base font-semibold">{station.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{station.address}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs font-semibold">
          <Star className="size-3.5 fill-accent text-accent" />
          {Number(station.rating).toFixed(1)}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Metric icon={MapPin} label="Distance" value={km(insight.distanceKm)} />
        <Metric
          icon={Plug}
          label="Available"
          value={`${insight.availableChargers}/${insight.totalChargers}`}
        />
        <Metric icon={Gauge} label="Max speed" value={`${insight.maxPowerKw} kW`} />
        <Metric icon={Timer} label="Wait" value={waitLabel(insight.waitMinutes)} />
      </dl>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm">
          <span className="font-display text-lg font-bold text-primary">
            {INR(insight.minPrice)}
          </span>
          <span className="text-xs text-muted-foreground">/kWh onwards</span>
        </p>
        <Button asChild size="sm">
          <Link to="/stations/$stationId" params={{ stationId: station.id }}>
            View Station
          </Link>
        </Button>
      </div>

      {highlight && insight.reasons.length > 0 && (
        <div className="mt-4 rounded-xl bg-secondary/60 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Why this station?
          </p>
          <ul className="mt-2 space-y-1">
            {insight.reasons.map((r) => (
              <li key={r} className="flex items-start gap-2 text-xs text-mint">
                <span className="text-accent">✓</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
    </div>
  );
}
