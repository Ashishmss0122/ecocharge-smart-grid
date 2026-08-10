import { supabase } from "@/integrations/supabase/client";
import type { PaymentRow } from "@/services/types";

export type PaymentWithSession = PaymentRow & {
  charging_sessions: {
    id: string;
    energy_kwh: number;
    started_at: string;
    ended_at: string | null;
  } | null;
  stations: { id: string; name: string } | null;
};

const PAYMENT_SELECT =
  "*, charging_sessions(id,energy_kwh,started_at,ended_at), stations(id,name)";

/** GET /api/payments/:id */
export async function getPaymentBySession(sessionId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_SELECT)
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return (data as PaymentWithSession | null) ?? null;
}

/** POST /api/payments — simulated checkout, no gateway involved. */
export async function payPayment(id: string) {
  const { data, error } = await supabase
    .from("payments")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id)
    .select(PAYMENT_SELECT)
    .single();
  if (error) throw error;
  return data as PaymentWithSession;
}

export async function listPayments(userId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PaymentWithSession[];
}

export async function listStationPayments(stationIds: string[]) {
  if (stationIds.length === 0) return [];
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_SELECT)
    .in("station_id", stationIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PaymentWithSession[];
}
