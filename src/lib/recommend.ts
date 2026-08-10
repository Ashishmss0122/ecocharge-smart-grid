import { haversineKm } from "@/lib/geo";
import type { ChargerRow, StationWithChargers } from "@/services/types";

export type StationInsight = {
  distanceKm: number;
  availableChargers: number;
  totalChargers: number;
  minPrice: number;
  maxPowerKw: number;
  waitMinutes: number;
  score: number;
  reasons: string[];
};

export function availableChargers(chargers: ChargerRow[]) {
  return chargers.filter((c) => c.status === "available");
}

/**
 * Wait-time estimation service.
 * Derived from charger count, chargers currently in use and queued bookings.
 */
export function estimateWaitMinutes(chargers: ChargerRow[], queuedBookings = 0) {
  const usable = chargers.filter(
    (c) => c.status === "available" || c.status === "in_use",
  );
  if (usable.length === 0) return 45;
  const free = usable.filter((c) => c.status === "available").length;
  const queue = Math.max(0, queuedBookings - free);
  if (free > 0 && queue === 0) return 0;
  const busy = usable.length - free;
  const averageSessionMinutes = 35;
  const load = (busy + queue) / usable.length;
  return Math.min(90, Math.round(load * averageSessionMinutes));
}

export function waitLabel(minutes: number) {
  return minutes <= 0 ? "Available Now" : `~${minutes} min wait`;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Smart recommendation scoring. Deliberately dependency-free so it can run in
 * the browser today and move behind an API or ML model later.
 */
export function scoreStation(
  station: StationWithChargers,
  origin: { lat: number; lng: number },
  queuedBookings = 0,
): StationInsight {
  const distanceKm = haversineKm(origin, {
    lat: Number(station.latitude),
    lng: Number(station.longitude),
  });
  const chargers = station.chargers ?? [];
  const free = availableChargers(chargers);
  const prices = chargers.map((c) => Number(c.price_per_kwh));
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPowerKw = chargers.length
    ? Math.max(...chargers.map((c) => Number(c.power_kw)))
    : 0;
  const waitMinutes = estimateWaitMinutes(chargers, queuedBookings);

  const distanceScore = clamp01(1 - distanceKm / 25);
  const priceScore = clamp01(1 - (minPrice - 8) / 12);
  const speedScore = clamp01(maxPowerKw / 120);
  const availabilityScore = chargers.length ? clamp01(free.length / chargers.length) : 0;
  const ratingScore = clamp01(Number(station.rating) / 5);
  const waitScore = clamp01(1 - waitMinutes / 45);

  const score = Math.round(
    (distanceScore * 0.26 +
      priceScore * 0.18 +
      speedScore * 0.16 +
      availabilityScore * 0.18 +
      ratingScore * 0.12 +
      waitScore * 0.1) *
      100,
  );

  const reasons: string[] = [];
  if (distanceKm < 4) reasons.push("Short distance from you");
  if (maxPowerKw >= 50) reasons.push(`Fast charger available (${maxPowerKw} kW)`);
  if (waitMinutes === 0) reasons.push("No waiting — chargers free right now");
  else if (waitMinutes <= 10) reasons.push("Low estimated waiting time");
  if (minPrice <= 12) reasons.push(`Competitive rate from ₹${minPrice}/kWh`);
  if (Number(station.rating) >= 4.5) reasons.push(`Highly rated ${station.rating}★`);
  if (free.length >= 3) reasons.push(`${free.length} chargers free`);

  return {
    distanceKm,
    availableChargers: free.length,
    totalChargers: chargers.length,
    minPrice,
    maxPowerKw,
    waitMinutes,
    score,
    reasons: reasons.slice(0, 4),
  };
}

export function recommendationVerdict(score: number) {
  if (score >= 78) return "Best overall choice";
  if (score >= 62) return "Great alternative";
  if (score >= 45) return "Worth considering";
  return "Backup option";
}

/** Energy delivered in a window, capped by realistic charging efficiency. */
export function estimateEnergy(powerKw: number, minutes: number) {
  return Number(((powerKw * minutes) / 60).toFixed(2));
}

export function estimateCost(energyKwh: number, pricePerKwh: number) {
  return Number((energyKwh * pricePerKwh).toFixed(2));
}
