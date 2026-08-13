import { describe, expect, it } from "vitest";

import { INR, km, kwh, minutesToLabel, shortId } from "@/lib/format";

describe("formatting helpers", () => {
  it("formats rupee amounts without stray decimals on whole numbers", () => {
    expect(INR(450)).toContain("450");
    expect(INR(450)).not.toContain(".00");
    expect(INR(369.5)).toContain("369.5");
  });

  it("formats energy with one decimal", () => {
    expect(kwh(24.63)).toBe("24.6 kWh");
  });

  it("switches from metres to kilometres", () => {
    expect(km(0.4)).toBe("400 m");
    expect(km(2.44)).toBe("2.4 km");
  });

  it("formats durations", () => {
    expect(minutesToLabel(30)).toBe("30 min");
    expect(minutesToLabel(60)).toBe("1 hr");
    expect(minutesToLabel(95)).toBe("1 hr 35 min");
  });

  it("builds a readable short booking id", () => {
    expect(shortId("3424edfa-7e54-4c40-9ef4-582d60d3a008")).toBe("EC-3424EDFA");
  });
});
