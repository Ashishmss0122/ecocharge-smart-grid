import { supabase } from "@/integrations/supabase/client";
import type { StationWithChargers } from "@/services/types";
import type { Database } from "@/integrations/supabase/types";

type StationInsert = Database["public"]["Tables"]["stations"]["Insert"];
type StationUpdate = Database["public"]["Tables"]["stations"]["Update"];
type ChargerInsert = Database["public"]["Tables"]["chargers"]["Insert"];
type ChargerUpdate = Database["public"]["Tables"]["chargers"]["Update"];

const STATION_SELECT = "*, chargers(*)";

/** GET /api/stations */
export async function listStations(): Promise<StationWithChargers[]> {
  const { data, error } = await supabase
    .from("stations")
    .select(STATION_SELECT)
    .eq("status", "approved")
    .order("name");
  if (error) throw error;
  return (data ?? []) as StationWithChargers[];
}

/** GET /api/stations/:id */
export async function getStation(id: string): Promise<StationWithChargers | null> {
  const { data, error } = await supabase
    .from("stations")
    .select(STATION_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as StationWithChargers | null) ?? null;
}

/** Owner scope: every station belonging to the signed-in owner. */
export async function listOwnerStations(ownerId: string): Promise<StationWithChargers[]> {
  const { data, error } = await supabase
    .from("stations")
    .select(STATION_SELECT)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as StationWithChargers[];
}

/** Admin scope: every station regardless of approval status. */
export async function listAllStations(): Promise<StationWithChargers[]> {
  const { data, error } = await supabase
    .from("stations")
    .select(STATION_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as StationWithChargers[];
}

/** POST /api/stations */
export async function createStation(payload: StationInsert) {
  const { data, error } = await supabase.from("stations").insert(payload).select().single();
  if (error) throw error;
  return data;
}

/** PUT /api/stations/:id */
export async function updateStation(id: string, payload: StationUpdate) {
  const { data, error } = await supabase
    .from("stations")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** DELETE /api/stations/:id */
export async function deleteStation(id: string) {
  const { error } = await supabase.from("stations").delete().eq("id", id);
  if (error) throw error;
}

/** GET /api/stations/:id/chargers */
export async function listChargers(stationId: string) {
  const { data, error } = await supabase
    .from("chargers")
    .select("*")
    .eq("station_id", stationId)
    .order("label");
  if (error) throw error;
  return data ?? [];
}

/** POST /api/chargers */
export async function createCharger(payload: ChargerInsert) {
  const { data, error } = await supabase.from("chargers").insert(payload).select().single();
  if (error) throw error;
  return data;
}

/** PUT /api/chargers/:id */
export async function updateCharger(id: string, payload: ChargerUpdate) {
  const { data, error } = await supabase
    .from("chargers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCharger(id: string) {
  const { error } = await supabase.from("chargers").delete().eq("id", id);
  if (error) throw error;
}

/** Bookings that are still queued/active per station — feeds wait-time estimation. */
export async function getQueueCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("bookings")
    .select("station_id")
    .in("status", ["confirmed", "active"])
    .gte("end_time", new Date().toISOString());
  if (error) return {};
  const counts: Record<string, number> = {};
  for (const row of data ?? []) counts[row.station_id] = (counts[row.station_id] ?? 0) + 1;
  return counts;
}
