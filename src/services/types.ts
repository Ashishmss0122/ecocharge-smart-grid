import type { Database } from "@/integrations/supabase/types";

export type ChargerType = Database["public"]["Enums"]["charger_type"];
export type ChargerStatus = Database["public"]["Enums"]["charger_status"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type StationStatus = Database["public"]["Enums"]["station_status"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export type StationRow = Database["public"]["Tables"]["stations"]["Row"];
export type ChargerRow = Database["public"]["Tables"]["chargers"]["Row"];
export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export type SessionRow = Database["public"]["Tables"]["charging_sessions"]["Row"];
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
export type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ComplaintRow = Database["public"]["Tables"]["complaints"]["Row"];

export type StationWithChargers = StationRow & { chargers: ChargerRow[] };

/** Service fee applied on every simulated payment. */
export const SERVICE_FEE = 20;

export const CHARGER_TYPE_LABEL: Record<ChargerType, string> = {
  dc_fast: "DC Fast",
  ac: "AC",
};

export const CHARGER_STATUS_LABEL: Record<ChargerStatus, string> = {
  available: "Available",
  in_use: "In Use",
  disabled: "Disabled",
  maintenance: "Maintenance",
};

export const ROLE_LABEL: Record<AppRole, string> = {
  ev_user: "EV User",
  station_owner: "Station Owner",
  admin: "Administrator",
};
