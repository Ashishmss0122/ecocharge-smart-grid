import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Map as MapIcon, Search } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { StationCard } from "@/components/StationCard";
import { StationMap } from "@/components/StationMap";
import { EmptyState, ErrorBlock, LoadingBlock } from "@/components/States";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HYDERABAD } from "@/lib/geo";
import { scoreStation } from "@/lib/recommend";
import { getQueueCounts, listStations } from "@/services/stations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/stations")({
  component: StationsPage,
});

function StationsPage() {
  const [view, setView] = useState<"list" | "map">("list");
  const [q, setQ] = useState("");

  const stationsQ = useQuery({ queryKey: ["stations"], queryFn: listStations });
  const queueQ = useQuery({ queryKey: ["queues"], queryFn: getQueueCounts });

  const entries = useMemo(() => {
    const stations = stationsQ.data ?? [];
    const queues = queueQ.data ?? {};
    return stations
      .map((station) => ({
        station,
        insight: scoreStation(station, HYDERABAD, queues[station.id] ?? 0),
      }))
      .filter(({ station }) =>
        q.trim()
          ? `${station.name} ${station.address} ${station.city}`
              .toLowerCase()
              .includes(q.trim().toLowerCase())
          : true,
      )
      .sort((a, b) => b.insight.score - a.insight.score);
  }, [stationsQ.data, queueQ.data, q]);

  return (
    <PageTransition>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Find a charging station</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by distance, availability, charging speed and price.
          </p>
        </div>
        <div className="flex gap-2 rounded-xl bg-secondary p-1">
          {(
            [
              ["list", "List", LayoutGrid],
              ["map", "Map", MapIcon],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                view === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, area or city"
          className="pl-9"
        />
      </div>

      {stationsQ.isLoading ? (
        <LoadingBlock label="Loading stations…" />
      ) : stationsQ.error ? (
        <div className="mt-6">
          <ErrorBlock message="We couldn't load stations right now." />
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Search}
            title="No stations match your search"
            description="Try a different area or clear the search field."
            action={<Button onClick={() => setQ("")}>Clear search</Button>}
          />
        </div>
      ) : view === "map" ? (
        <div className="mt-6">
          <StationMap entries={entries} />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {entries.map((entry, i) => (
            <StationCard
              key={entry.station.id}
              station={entry.station}
              insight={entry.insight}
              highlight={i === 0 && !q.trim()}
            />
          ))}
        </div>
      )}
    </PageTransition>
  );
}
