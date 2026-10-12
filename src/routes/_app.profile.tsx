import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BatteryCharging,
  CarFront,
  Check,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/PageTransition";
import { EmptyState, ErrorBlock, LoadingBlock } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  addVehicle,
  deleteVehicle,
  listVehicles,
  setPrimaryVehicle,
  updateProfile,
} from "@/services/profile";
import { ROLE_LABEL, type ChargerType } from "@/services/types";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, roles, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.id ?? "";
  const vehiclesQ = useQuery({
    queryKey: ["vehicles", uid],
    queryFn: () => listVehicles(uid),
    enabled: !!uid,
  });
  const vehicles = vehiclesQ.data ?? [];
  const [account, setAccount] = useState<{
    name: string;
    phone: string;
    preferred_charger_type: ChargerType | "";
    target_battery_level: number;
  }>({
    name: "",
    phone: "",
    preferred_charger_type: "",
    target_battery_level: 80,
  });
  const [vehicleForm, setVehicleForm] = useState({
    make: "",
    model: "",
    registration_no: "",
    battery_capacity_kwh: "40",
  });

  useEffect(() => {
    if (!profile) return;
    setAccount({
      name: profile.name,
      phone: profile.phone ?? "",
      preferred_charger_type: profile.preferred_charger_type ?? "",
      target_battery_level: profile.target_battery_level,
    });
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("You must be signed in to update your profile.");
      return updateProfile(user.id, {
        name: account.name.trim(),
        phone: account.phone.trim() || null,
        preferred_charger_type:
          account.preferred_charger_type === "" ? null : account.preferred_charger_type,
        target_battery_level: account.target_battery_level,
      });
    },
    onSuccess: async () => {
      await refreshProfile();
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update your profile");
    },
  });

  const addVehicleMutation = useMutation({
    mutationFn: () =>
      addVehicle({
        user_id: uid,
        make: vehicleForm.make.trim(),
        model: vehicleForm.model.trim(),
        registration_no: vehicleForm.registration_no.trim() || null,
        battery_capacity_kwh: Number(vehicleForm.battery_capacity_kwh),
        is_primary: vehicles.length === 0,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vehicles", uid] });
      setVehicleForm({ make: "", model: "", registration_no: "", battery_capacity_kwh: "40" });
      toast.success("Vehicle added");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not add this vehicle");
    },
  });

  const primaryVehicleMutation = useMutation({
    mutationFn: (vehicleId: string) => setPrimaryVehicle(uid, vehicleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vehicles", uid] });
      toast.success("Primary vehicle updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update your primary vehicle");
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (vehicleId: string) => deleteVehicle(vehicleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vehicles", uid] });
      toast.success("Vehicle removed");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not remove this vehicle");
    },
  });

  const displayName = profile?.name || user?.email?.split("@")[0] || "EcoCharge driver";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    profileMutation.mutate();
  }

  function saveVehicle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addVehicleMutation.mutate();
  }

  function removeVehicle(vehicleId: string, vehicleName: string) {
    if (window.confirm(`Remove ${vehicleName} from your vehicles?`)) {
      deleteVehicleMutation.mutate(vehicleId);
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-7">
        <header className="flex flex-col gap-5 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/12 via-card/70 to-card/30 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/15">
              {initials || <UserRound className="size-7" />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Your EcoCharge account
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{displayName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your details, charging preferences, and EVs.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {roles.length > 0 ? (
              roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background/55 px-3 py-1.5 text-xs font-medium"
                >
                  <ShieldCheck className="size-3.5 text-primary" />
                  {ROLE_LABEL[role]}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/55 px-3 py-1.5 text-xs font-medium">
                <ShieldCheck className="size-3.5 text-primary" />
                EV User
              </span>
            )}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="glass rounded-2xl p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                <UserRound className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold">Personal details</h2>
                <p className="text-sm text-muted-foreground">
                  Keep your contact details up to date.
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={saveProfile}>
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  required
                  maxLength={80}
                  autoComplete="name"
                  value={account.name}
                  onChange={(event) => setAccount({ ...account, name: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-email"
                    className="pl-9"
                    type="email"
                    value={profile?.email ?? user?.email ?? ""}
                    readOnly
                    aria-describedby="profile-email-note"
                  />
                </div>
                <p id="profile-email-note" className="text-xs text-muted-foreground">
                  Email is managed by your sign-in provider.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone number</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-phone"
                    className="pl-9"
                    type="tel"
                    maxLength={20}
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    value={account.phone}
                    onChange={(event) => setAccount({ ...account, phone: event.target.value })}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={profileMutation.isPending}
              >
                {profileMutation.isPending ? "Saving changes…" : "Save profile"}
              </Button>
            </form>
          </section>

          <section className="glass rounded-2xl p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                <Zap className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold">Charging preferences</h2>
                <p className="text-sm text-muted-foreground">
                  Personalize your charging recommendations.
                </p>
              </div>
            </div>
            <form className="space-y-5" onSubmit={saveProfile}>
              <div className="space-y-2">
                <Label htmlFor="preferred-charger">Preferred charger</Label>
                <select
                  id="preferred-charger"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={account.preferred_charger_type}
                  onChange={(event) =>
                    setAccount({
                      ...account,
                      preferred_charger_type:
                        event.target.value === "ac" || event.target.value === "dc_fast"
                          ? event.target.value
                          : "",
                    })
                  }
                >
                  <option value="">No preference</option>
                  <option value="dc_fast">DC fast charging</option>
                  <option value="ac">AC charging</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="target-battery">Target battery level</Label>
                  <span className="rounded-full bg-primary/12 px-2.5 py-1 text-sm font-semibold text-primary">
                    {account.target_battery_level}%
                  </span>
                </div>
                <input
                  id="target-battery"
                  type="range"
                  min={20}
                  max={100}
                  step={5}
                  className="h-2 w-full cursor-pointer accent-primary"
                  value={account.target_battery_level}
                  onChange={(event) =>
                    setAccount({ ...account, target_battery_level: Number(event.target.value) })
                  }
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>20%</span>
                  <span>Recommended: 80%</span>
                  <span>100%</span>
                </div>
              </div>
              <Button type="submit" variant="outline" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? "Saving…" : "Save preferences"}
              </Button>
            </form>
          </section>
        </div>

        <section className="glass rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                <CarFront className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold">My vehicles</h2>
                <p className="text-sm text-muted-foreground">
                  {vehicles.length === 1 ? "1 vehicle saved" : `${vehicles.length} vehicles saved`}
                  {" · "}Add your EV for more relevant charging recommendations.
                </p>
              </div>
            </div>
            {vehicles.length > 0 && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <BatteryCharging className="size-3.5 text-primary" />
                EV garage
              </span>
            )}
          </div>

          {vehiclesQ.isLoading ? (
            <LoadingBlock label="Loading your vehicles…" />
          ) : vehiclesQ.isError ? (
            <div className="space-y-3">
              <ErrorBlock
                message={
                  vehiclesQ.error instanceof Error
                    ? vehiclesQ.error.message
                    : "Could not load your vehicles."
                }
              />
              <Button variant="outline" size="sm" onClick={() => void vehiclesQ.refetch()}>
                Try again
              </Button>
            </div>
          ) : vehicles.length === 0 ? (
            <EmptyState
              icon={CarFront}
              title="Your garage is ready"
              description="Add your first EV below to keep its details handy and personalize charging suggestions."
            />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {vehicles.map((vehicle) => (
                <li
                  key={vehicle.id}
                  className="rounded-2xl border border-border/80 bg-background/45 p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                        <CarFront className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          {vehicle.is_primary && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              <Star className="size-3 fill-current" />
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {vehicle.registration_no || "No registration added"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${vehicle.make} ${vehicle.model}`}
                      disabled={deleteVehicleMutation.isPending}
                      onClick={() => removeVehicle(vehicle.id, `${vehicle.make} ${vehicle.model}`)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Zap className="size-4 text-primary" />
                      {Number(vehicle.battery_capacity_kwh).toLocaleString()} kWh battery
                    </span>
                    {!vehicle.is_primary && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={primaryVehicleMutation.isPending}
                        onClick={() => primaryVehicleMutation.mutate(vehicle.id)}
                      >
                        Set primary
                      </Button>
                    )}
                    {vehicle.is_primary && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <Check className="size-3.5" />
                        Default for bookings
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form
            className="mt-6 rounded-2xl border border-dashed border-border bg-background/25 p-4 sm:p-5"
            onSubmit={saveVehicle}
          >
            <div className="mb-4 flex items-center gap-2">
              <Plus className="size-4 text-primary" />
              <h3 className="font-semibold">Add a vehicle</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle-make">Make</Label>
                <Input
                  id="vehicle-make"
                  required
                  maxLength={60}
                  placeholder="e.g. Tata"
                  value={vehicleForm.make}
                  onChange={(event) => setVehicleForm({ ...vehicleForm, make: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-model">Model</Label>
                <Input
                  id="vehicle-model"
                  required
                  maxLength={60}
                  placeholder="e.g. Nexon EV"
                  value={vehicleForm.model}
                  onChange={(event) =>
                    setVehicleForm({ ...vehicleForm, model: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-registration">Registration (optional)</Label>
                <Input
                  id="vehicle-registration"
                  maxLength={20}
                  placeholder="e.g. KA 01 AB 1234"
                  value={vehicleForm.registration_no}
                  onChange={(event) =>
                    setVehicleForm({ ...vehicleForm, registration_no: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-battery">Battery capacity (kWh)</Label>
                <Input
                  id="vehicle-battery"
                  type="number"
                  required
                  min={1}
                  max={500}
                  step="0.1"
                  value={vehicleForm.battery_capacity_kwh}
                  onChange={(event) =>
                    setVehicleForm({ ...vehicleForm, battery_capacity_kwh: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={addVehicleMutation.isPending}>
                <Plus className="size-4" />
                {addVehicleMutation.isPending ? "Adding vehicle…" : "Add vehicle"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </PageTransition>
  );
}
