import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Plug, Star } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBlock, LoadingBlock } from "@/components/States";
import { Button } from "@/components/ui/button";
import { getStation } from "@/services/stations";
import { CHARGER_STATUS_LABEL, CHARGER_TYPE_LABEL } from "@/services/types";
import { INR } from "@/lib/format";

export const Route = createFileRoute("/_app/stations/$stationId")({
  component: StationDetailPage,
});

function StationDetailPage() {
  const { stationId } = Route.useParams();
  const stationQ = useQuery({
    queryKey: ["station", stationId],
    queryFn: () => getStation(stationId),
  });

  if (stationQ.isLoading) return <LoadingBlock label="Loading station…" />;
  if (stationQ.error || !stationQ.data)
    return <ErrorBlock message="This station could not be found." />;

  const station = stationQ.data;

  return (
    <PageTransition>
      <Link to="/stations" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to stations
      </Link>

      <div className="glass mt-4 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">{station.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {station.address}, {station.city}
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold">
            <Star className="size-4 fill-accent text-accent" />
            {Number(station.rating).toFixed(1)}
          </span>
        </div>
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold">Chargers</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {station.chargers.map((c) => (
          <div key={c.id} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{c.label}</p>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {CHARGER_STATUS_LABEL[c.status]}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Plug className="size-4" /> {CHARGER_TYPE_LABEL[c.charger_type]} · {c.power_kw} kW
            </p>
            <p className="mt-3 font-display text-lg font-bold text-primary">
              {INR(Number(c.price_per_kwh))}
              <span className="text-xs font-normal text-muted-foreground">/kWh</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Button size="lg" asChild>
          <Link to="/booking/$stationId" params={{ stationId: station.id }}>
            Book a slot
          </Link>
        </Button>
      </div>

    </PageTransition>
  );
}
