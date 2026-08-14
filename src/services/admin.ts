import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/services/types";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  roles: AppRole[];
};

export async function listUsers(): Promise<AdminUser[]> {
  const [{ data: profiles, error }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  if (error) throw error;
  const byUser = new Map<string, AppRole[]>();
  for (const r of roles ?? []) {
    byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r.role]);
  }
  return (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    phone: p.phone,
    created_at: p.created_at,
    roles: byUser.get(p.id) ?? [],
  }));
}

export async function getPlatformStats() {
  const [users, stations, chargers, bookings, payments, sessions] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("stations").select("id,status", { count: "exact" }),
    supabase.from("chargers").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id,created_at,status", { count: "exact" }),
    supabase.from("payments").select("total_amount,status,created_at"),
    supabase
      .from("charging_sessions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const revenue = (payments.data ?? [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.total_amount), 0);

  return {
    totalUsers: users.count ?? 0,
    totalStations: stations.count ?? 0,
    pendingStations: (stations.data ?? []).filter((s) => s.status === "pending").length,
    totalChargers: chargers.count ?? 0,
    totalBookings: bookings.count ?? 0,
    activeSessions: sessions.count ?? 0,
    totalRevenue: revenue,
    bookings: bookings.data ?? [],
    payments: payments.data ?? [],
  };
}

export async function setStationStatus(id: string, status: "approved" | "rejected" | "pending") {
  const { error } = await supabase.from("stations").update({ status }).eq("id", id);
  if (error) throw error;
}
