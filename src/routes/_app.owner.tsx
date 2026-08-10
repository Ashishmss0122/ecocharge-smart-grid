import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Plug, Wallet } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { StatCard } from "@/components/StatCard";
import { EmptyState, LoadingBlock } from "@/components/States";
import { useAuth } from "@/contexts/AuthContext";
import { listOwnerStations } from "@/services/stations";
import { listStationPayments } from "@/services/payments";
import { INR } from "@/lib/format";

export const Route = createFileRoute("/_app/owner")({
  component: OwnerPage,
});

function OwnerPage() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const stationsQ = useQuery({
    queryKey: ["owner-stations", uid],
    queryFn: () => listOwnerStations(uid),
    enabled: !!uid,
  });
  const stations = stationsQ.data ?? [];
  const paymentsQ = useQuery({
    queryKey: ["owner-payments", stations.map((s) => s.id).join(",")],
    queryFn: () => listStationPayments(stations.map((s) => s.id)),
    enabled: stations.length > 0,
  });

  const revenue = (paymentsQ.data ?? [])
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + Number(p.total_amount), 0);
  const chargers = stations.reduce((s, st) => s + st.chargers.length, 0);

  return (
    <PageTransition>
      <h1 className="font-display text-2xl font-bold">My stations</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Operational overview of the stations you own.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} label="Stations" value={stations.length} />
        <StatCard icon={Plug} label="Chargers" value={chargers} />
        <StatCard icon={Wallet} label="Revenue" value={INR(revenue)} />
      </div>

      {stationsQ.isLoading ? (
        <LoadingBlock />
      ) : stations.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Building2}
            title="No stations yet"
            description="Stations you own will appear here with live analytics."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {stations.map((s) => (
            <div
              key={s.id}
              className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
            >
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.address}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{s.chargers.length} chargers</p>
                <p className="uppercase tracking-wider">{s.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
