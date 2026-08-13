import { afterEach, describe, expect, it, vi } from "vitest";

import { logger, redact } from "@/lib/logger";

afterEach(() => vi.restoreAllMocks());

describe("logger", () => {
  it("never emits sensitive values", () => {
    const out = redact({ userId: "u1", password: "hunter2", access_token: "abc", apiKey: "x" });
    expect(out).toEqual({
      userId: "u1",
      password: "[redacted]",
      access_token: "[redacted]",
      apiKey: "[redacted]",
    });
  });

  it("writes single-line JSON with level and event", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("db.connect", { message: "timeout" });
    expect(spy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(spy.mock.calls[0][0] as string);
    expect(payload.level).toBe("error");
    expect(payload.event).toBe("db.connect");
    expect(payload.message).toBe("timeout");
    expect(typeof payload.time).toBe("string");
  });
});
