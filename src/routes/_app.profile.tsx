import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageTransition } from "@/components/PageTransition";
import { LoadingBlock } from "@/components/States";
import { useAuth } from "@/contexts/AuthContext";
import { listVehicles } from "@/services/profile";
import { ROLE_LABEL } from "@/services/types";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, roles } = useAuth();
  const uid = user?.id ?? "";
  const vehiclesQ = useQuery({
    queryKey: ["vehicles", uid],
    queryFn: () => listVehicles(uid),
    enabled: !!uid,
  });

  return (
    <PageTransition>
      <h1 className="font-display text-2xl font-bold">Profile</h1>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Name" value={profile?.name ?? "—"} />
            <Row label="Email" value={profile?.email ?? user?.email ?? "—"} />
            <Row label="Phone" value={profile?.phone ?? "—"} />
            <Row
              label="Roles"
              value={roles.map((r) => ROLE_LABEL[r]).join(", ") || "EV User"}
            />
          </dl>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">My vehicles</h2>
          {vehiclesQ.isLoading ? (
            <LoadingBlock label="Loading vehicles…" />
          ) : (vehiclesQ.data ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No vehicles saved yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {(vehiclesQ.data ?? []).map((v) => (
                <li key={v.id} className="rounded-xl bg-secondary/60 p-3">
                  <p className="font-semibold">
                    {v.make} {v.model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {v.registration_no} · {v.battery_capacity_kwh} kWh
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageTransition>
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
