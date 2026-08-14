import { describe, expect, it } from "vitest";

import {
  availableChargers,
  estimateCost,
  estimateEnergy,
  estimateWaitMinutes,
  recommendationVerdict,
  scoreStation,
  waitLabel,
} from "@/lib/recommend";
import type { ChargerRow, StationWithChargers } from "@/services/types";

const charger = (over: Partial<ChargerRow> = {}) =>
  ({
    id: over.id ?? "c1",
    station_id: "s1",
    label: "Charger #01",
    charger_type: "dc_fast",
    power_kw: 60,
    price_per_kwh: 15,
    status: "available",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...over,
  }) as ChargerRow;

const station = (over: Partial<StationWithChargers> = {}) =>
  ({
    id: "s1",
    name: "EcoCharge Gachibowli",
    address: "Gachibowli, Hyderabad",
    latitude: 17.4401,
    longitude: 78.3489,
    rating: 4.7,
    status: "approved",
    chargers: [charger()],
    ...over,
  }) as unknown as StationWithChargers;

const origin = { lat: 17.4401, lng: 78.3489 };

describe("energy and cost estimation", () => {
  it("computes kWh delivered for a duration", () => {
    expect(estimateEnergy(60, 30)).toBe(30);
    expect(estimateEnergy(22, 45)).toBeCloseTo(16.5, 2);
  });

  it("computes cost from energy and tariff", () => {
    expect(estimateCost(30, 15)).toBe(450);
    expect(estimateCost(24.6, 15)).toBe(369);
  });
});

describe("wait time estimation", () => {
  it("reports no wait when a charger is free and nothing is queued", () => {
    expect(estimateWaitMinutes([charger(), charger({ id: "c2", status: "in_use" })], 0)).toBe(0);
    expect(waitLabel(0)).toBe("Available Now");
  });

  it("returns a wait when every charger is busy", () => {
    const busy = [charger({ status: "in_use" }), charger({ id: "c2", status: "in_use" })];
    const wait = estimateWaitMinutes(busy, 2);
    expect(wait).toBeGreaterThan(0);
    expect(waitLabel(wait)).toContain("wait");
  });

  it("ignores disabled/maintenance chargers and degrades gracefully", () => {
    expect(estimateWaitMinutes([charger({ status: "maintenance" })], 0)).toBe(45);
  });

  it("never exceeds the 90 minute cap", () => {
    const busy = Array.from({ length: 3 }, (_, i) => charger({ id: `c${i}`, status: "in_use" }));
    expect(estimateWaitMinutes(busy, 50)).toBeLessThanOrEqual(90);
  });
});

describe("availableChargers", () => {
  it("only counts chargers with status available", () => {
    const list = [charger(), charger({ id: "c2", status: "in_use" }), charger({ id: "c3" })];
    expect(availableChargers(list)).toHaveLength(2);
  });
});

describe("scoreStation", () => {
  it("scores a close, cheap, fast, free station above a far, slow, busy one", () => {
    const good = scoreStation(station(), origin);
    const bad = scoreStation(
      station({
        latitude: 17.9,
        longitude: 78.9,
        rating: 3.1,
        chargers: [charger({ power_kw: 7, price_per_kwh: 19, status: "in_use" })],
      } as Partial<StationWithChargers>),
      origin,
    );
    expect(good.score).toBeGreaterThan(bad.score);
  });

  it("keeps the score within 0-100 and exposes explainable reasons", () => {
    const insight = scoreStation(station(), origin);
    expect(insight.score).toBeGreaterThanOrEqual(0);
    expect(insight.score).toBeLessThanOrEqual(100);
    expect(insight.reasons.length).toBeGreaterThan(0);
    expect(insight.reasons.length).toBeLessThanOrEqual(4);
    expect(insight.availableChargers).toBe(1);
    expect(insight.minPrice).toBe(15);
    expect(insight.maxPowerKw).toBe(60);
  });

  it("handles a station with no chargers without throwing", () => {
    const insight = scoreStation(station({ chargers: [] }), origin);
    expect(insight.totalChargers).toBe(0);
    expect(insight.availableChargers).toBe(0);
  });
});

describe("recommendationVerdict", () => {
  it("maps score bands to labels", () => {
    expect(recommendationVerdict(90)).toBe("Best overall choice");
    expect(recommendationVerdict(70)).toBe("Great alternative");
    expect(recommendationVerdict(50)).toBe("Worth considering");
    expect(recommendationVerdict(10)).toBe("Backup option");
  });
});
