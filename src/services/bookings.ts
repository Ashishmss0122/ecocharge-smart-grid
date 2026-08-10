import { supabase } from "@/integrations/supabase/client";
import { estimateCost, estimateEnergy } from "@/lib/recommend";
import type { BookingRow, ChargerRow, StationRow } from "@/services/types";

export type BookingWithRelations = BookingRow & {
  stations: Pick<StationRow, "id" | "name" | "address" | "latitude" | "longitude"> | null;
  chargers: Pick<ChargerRow, "id" | "label" | "charger_type" | "power_kw" | "price_per_kwh"> | null;
};

const BOOKING_SELECT =
  "*, stations(id,name,address,latitude,longitude), chargers(id,label,charger_type,power_kw,price_per_kwh)";

export class BookingConflictError extends Error {
  constructor() {
    super("That charger is already booked for the selected time slot.");
    this.name = "BookingConflictError";
  }
}

export function quoteBooking(charger: ChargerRow, durationMinutes: number) {
  const energy = estimateEnergy(Number(charger.power_kw), durationMinutes);
  const cost = estimateCost(energy, Number(charger.price_per_kwh));
  return { energy, cost };
}

/** POST /api/bookings */
export async function createBooking(input: {
  userId: string;
  stationId: string;
  charger: ChargerRow;
  vehicleId?: string | null;
  startTime: Date;
  durationMinutes: number;
}) {
  const { energy, cost } = quoteBooking(input.charger, input.durationMinutes);
  const end = new Date(input.startTime.getTime() + input.durationMinutes * 60_000);

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: input.userId,
      station_id: input.stationId,
      charger_id: input.charger.id,
      vehicle_id: input.vehicleId ?? null,
      start_time: input.startTime.toISOString(),
      end_time: end.toISOString(),
      duration_minutes: input.durationMinutes,
      estimated_energy_kwh: energy,
      estimated_cost: cost,
      status: "confirmed",
    })
    .select()
    .single();

  if (error) {
    // 23P01 = exclusion constraint violation (overlapping booking on that charger)
    if (error.code === "23P01") throw new BookingConflictError();
    throw error;
  }
  return data;
}

/** GET /api/bookings */
export async function listBookings(userId: string): Promise<BookingWithRelations[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("user_id", userId)
    .order("start_time", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BookingWithRelations[];
}

/** GET /api/bookings/:id */
export async function getBooking(id: string): Promise<BookingWithRelations | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as BookingWithRelations | null) ?? null;
}

/** PUT /api/bookings/:id/cancel */
export async function cancelBooking(id: string) {
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw error;
}

/** Existing bookings for one charger on a given day — powers the slot picker. */
export async function listChargerBookings(chargerId: string, day: Date) {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data, error } = await supabase
    .from("bookings")
    .select("start_time,end_time,status")
    .eq("charger_id", chargerId)
    .in("status", ["confirmed", "active"])
    .gte("start_time", start.toISOString())
    .lt("start_time", end.toISOString());
  if (error) return [];
  return data ?? [];
}

/** Owner scope: bookings across all of an owner's stations. */
export async function listStationBookings(stationIds: string[]) {
  if (stationIds.length === 0) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .in("station_id", stationIds)
    .order("start_time", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BookingWithRelations[];
}
