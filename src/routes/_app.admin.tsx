import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BatteryCharging, Building2, Users, Wallet } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { StatCard } from "@/components/StatCard";
import { LoadingBlock } from "@/components/States";
import { getPlatformStats, listUsers } from "@/services/admin";
import { ROLE_LABEL } from "@/services/types";
import { INR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_app/admin")({
  component: AdminPage,
});

function AdminPage() {
  const statsQ = useQuery({ queryKey: ["admin-stats"], queryFn: getPlatformStats });
  const usersQ = useQuery({ queryKey: ["admin-users"], queryFn: listUsers });

  return (
    <PageTransition>
      <h1 className="font-display text-2xl font-bold">Admin console</h1>
      <p className="mt-1 text-sm text-muted-foreground">Platform-wide health and activity.</p>

      {statsQ.isLoading ? (
        <LoadingBlock />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Users" value={statsQ.data?.totalUsers ?? 0} />
          <StatCard icon={Building2} label="Stations" value={statsQ.data?.totalStations ?? 0} />
          <StatCard
            icon={BatteryCharging}
            label="Active sessions"
            value={statsQ.data?.activeSessions ?? 0}
          />
          <StatCard
            icon={Wallet}
            label="Revenue"
            value={INR(statsQ.data?.totalRevenue ?? 0)}
          />
        </div>
      )}

      <h2 className="mt-8 font-display text-lg font-semibold">Users</h2>
      {usersQ.isLoading ? (
        <LoadingBlock />
      ) : (
        <div className="mt-4 space-y-3">
          {(usersQ.data ?? []).map((u) => (
            <div
              key={u.id}
              className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
            >
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{u.roles.map((r) => ROLE_LABEL[r]).join(", ") || "—"}</p>
                <p>Joined {formatDate(u.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
