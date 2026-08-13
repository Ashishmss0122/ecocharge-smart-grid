import { describe, expect, it } from "vitest";

import { HYDERABAD, boundsOf, haversineKm, projectToBox } from "@/lib/geo";

describe("haversineKm", () => {
  it("returns 0 for the same point", () => {
    expect(haversineKm(HYDERABAD, HYDERABAD)).toBe(0);
  });

  it("matches a known Hyderabad distance (Gachibowli -> Secunderabad)", () => {
    const gachibowli = { lat: 17.4401, lng: 78.3489 };
    const secunderabad = { lat: 17.4399, lng: 78.4983 };
    const d = haversineKm(gachibowli, secunderabad);
    expect(d).toBeGreaterThan(14);
    expect(d).toBeLessThan(17);
  });

  it("is symmetric", () => {
    const a = { lat: 17.44, lng: 78.34 };
    const b = { lat: 17.49, lng: 78.42 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 10);
  });
});

describe("boundsOf", () => {
  it("falls back to the Hyderabad box when there are no points", () => {
    expect(boundsOf([])).toEqual({ minLat: 17.3, maxLat: 17.5, minLng: 78.3, maxLng: 78.55 });
  });

  it("computes the min/max envelope", () => {
    expect(boundsOf([{ lat: 1, lng: 5 }, { lat: 3, lng: 2 }])).toEqual({
      minLat: 1,
      maxLat: 3,
      minLng: 2,
      maxLng: 5,
    });
  });
});

describe("projectToBox", () => {
  const bounds = { minLat: 0, maxLat: 10, minLng: 0, maxLng: 10 };

  it("keeps projected coordinates inside the padded 0-100 box", () => {
    for (const p of [{ lat: 0, lng: 0 }, { lat: 10, lng: 10 }, { lat: 5, lng: 5 }]) {
      const { x, y } = projectToBox(p, bounds);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
  });

  it("puts higher latitude nearer the top of the map", () => {
    const north = projectToBox({ lat: 9, lng: 5 }, bounds);
    const south = projectToBox({ lat: 1, lng: 5 }, bounds);
    expect(north.y).toBeLessThan(south.y);
  });
});
