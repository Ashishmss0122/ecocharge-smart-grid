import { describe, expect, it, vi } from "vitest";

// The booking service imports the browser Supabase client; the pure pricing and
// conflict-handling logic is what we assert here, so the client is stubbed.
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

const { BookingConflictError, quoteBooking } = await import("@/services/bookings");
import type { ChargerRow } from "@/services/types";

const charger = (power: number, price: number) =>
  ({ id: "c1", power_kw: power, price_per_kwh: price }) as unknown as ChargerRow;

describe("quoteBooking", () => {
  it("quotes 30 min on a 60 kW / ₹15 charger as 30 kWh and ₹450", () => {
    expect(quoteBooking(charger(60, 15), 30)).toEqual({ energy: 30, cost: 450 });
  });

  it("quotes an AC 22 kW / ₹10 charger for an hour", () => {
    const quote = quoteBooking(charger(22, 10), 60);
    expect(quote.energy).toBeCloseTo(22, 2);
    expect(quote.cost).toBeCloseTo(220, 2);
  });

  it("scales linearly with duration", () => {
    const half = quoteBooking(charger(50, 12), 30);
    const full = quoteBooking(charger(50, 12), 60);
    expect(full.energy).toBeCloseTo(half.energy * 2, 5);
    expect(full.cost).toBeCloseTo(half.cost * 2, 5);
  });
});

describe("BookingConflictError", () => {
  it("carries a user-facing double-booking message", () => {
    const err = new BookingConflictError();
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("BookingConflictError");
    expect(err.message).toMatch(/already booked/i);
  });
});
