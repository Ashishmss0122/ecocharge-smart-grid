import { supabase } from "@/integrations/supabase/client";
import { SERVICE_FEE } from "@/services/types";
import type { ChargerRow, SessionRow } from "@/services/types";

export type SessionWithRelations = SessionRow & {
  stations: { id: string; name: string; address: string } | null;
  chargers: Pick<ChargerRow, "id" | "label" | "charger_type" | "power_kw" | "price_per_kwh"> | null;
  bookings: { id: string; duration_minutes: number } | null;
};

const SESSION_SELECT =
  "*, stations(id,name,address), chargers(id,label,charger_type,power_kw,price_per_kwh), bookings(id,duration_minutes)";

/** POST /api/charging/start */
export async function startSession(input: {
  bookingId: string;
  userId: string;
  stationId: string;
  chargerId: string;
  startBattery: number;
}) {
  const existing = await getSessionByBooking(input.bookingId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("charging_sessions")
    .insert({
      booking_id: input.bookingId,
      user_id: input.userId,
      station_id: input.stationId,
      charger_id: input.chargerId,
      start_battery: input.startBattery,
      current_battery: input.startBattery,
      status: "active",
    })
    .select(SESSION_SELECT)
    .single();
  if (error) throw error;

  await supabase.from("bookings").update({ status: "active" }).eq("id", input.bookingId);
  await supabase.from("chargers").update({ status: "in_use" }).eq("id", input.chargerId);

  return data as SessionWithRelations;
}

/** PUT /api/charging/:id/progress */
export async function updateSessionProgress(
  id: string,
  patch: { current_battery: number; energy_kwh: number; cost: number },
) {
  const { error } = await supabase.from("charging_sessions").update(patch).eq("id", id);
  if (error) throw error;
}

/** POST /api/charging/:id/stop */
export async function stopSession(input: {
  sessionId: string;
  bookingId: string;
  chargerId: string;
  stationId: string;
  userId: string;
  currentBattery: number;
  energyKwh: number;
  ratePerKwh: number;
}) {
  const cost = Number((input.energyKwh * input.ratePerKwh).toFixed(2));

  const { data, error } = await supabase
    .from("charging_sessions")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      current_battery: input.currentBattery,
      energy_kwh: Number(input.energyKwh.toFixed(2)),
      cost,
    })
    .eq("id", input.sessionId)
    .select(SESSION_SELECT)
    .single();
  if (error) throw error;

  await supabase.from("bookings").update({ status: "completed" }).eq("id", input.bookingId);
  await supabase.from("chargers").update({ status: "available" }).eq("id", input.chargerId);

  // Create the pending payment record for the simulated checkout.
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id")
    .eq("session_id", input.sessionId)
    .maybeSingle();

  if (!existingPayment) {
    await supabase.from("payments").insert({
      session_id: input.sessionId,
      user_id: input.userId,
      station_id: input.stationId,
      energy_kwh: Number(input.energyKwh.toFixed(2)),
      rate_per_kwh: input.ratePerKwh,
      service_fee: SERVICE_FEE,
      total_amount: Number((cost + SERVICE_FEE).toFixed(2)),
      status: "pending",
    });
  }

  return data as SessionWithRelations;
}

export async function getSessionByBooking(bookingId: string) {
  const { data, error } = await supabase
    .from("charging_sessions")
    .select(SESSION_SELECT)
    .eq("booking_id", bookingId)
    .maybeSingle();
  if (error) throw error;
  return (data as SessionWithRelations | null) ?? null;
}

export async function getSession(id: string) {
  const { data, error } = await supabase
    .from("charging_sessions")
    .select(SESSION_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as SessionWithRelations | null) ?? null;
}

/** Charging history for the signed-in driver. */
export async function listSessions(userId: string) {
  const { data, error } = await supabase
    .from("charging_sessions")
    .select(SESSION_SELECT)
    .eq("user_id", userId)
    .order("started_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SessionWithRelations[];
}
