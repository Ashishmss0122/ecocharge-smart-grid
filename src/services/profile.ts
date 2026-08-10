import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { ProfileRow, VehicleRow } from "@/services/types";

type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"];

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function updateProfile(
  userId: string,
  patch: Database["public"]["Tables"]["profiles"]["Update"],
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listVehicles(userId: string): Promise<VehicleRow[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function addVehicle(payload: VehicleInsert) {
  const { data, error } = await supabase
    .from("vehicles")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateVehicle(
  id: string,
  patch: Database["public"]["Tables"]["vehicles"]["Update"],
) {
  const { data, error } = await supabase
    .from("vehicles")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteVehicle(id: string) {
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw error;
}

export async function setPrimaryVehicle(userId: string, vehicleId: string) {
  await supabase.from("vehicles").update({ is_primary: false }).eq("user_id", userId);
  const { error } = await supabase
    .from("vehicles")
    .update({ is_primary: true })
    .eq("id", vehicleId);
  if (error) throw error;
}

export async function listSavedStations(userId: string) {
  const { data, error } = await supabase
    .from("saved_stations")
    .select("station_id, stations(id,name,address,rating)")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export async function toggleSavedStation(userId: string, stationId: string, save: boolean) {
  if (save) {
    const { error } = await supabase
      .from("saved_stations")
      .insert({ user_id: userId, station_id: stationId });
    if (error && error.code !== "23505") throw error;
  } else {
    const { error } = await supabase
      .from("saved_stations")
      .delete()
      .eq("user_id", userId)
      .eq("station_id", stationId);
    if (error) throw error;
  }
}

export async function fileComplaint(payload: {
  user_id: string;
  station_id?: string | null;
  subject: string;
  message: string;
}) {
  const { error } = await supabase.from("complaints").insert(payload);
  if (error) throw error;
}

export async function listComplaints(userId?: string) {
  let query = supabase
    .from("complaints")
    .select("*, stations(id,name)")
    .order("created_at", { ascending: false });
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function updateComplaintStatus(
  id: string,
  status: Database["public"]["Enums"]["complaint_status"],
) {
  const { error } = await supabase.from("complaints").update({ status }).eq("id", id);
  if (error) throw error;
}
