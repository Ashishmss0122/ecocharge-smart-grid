/**
 * Minimal structured logger used by server routes and service-layer error paths.
 *
 * Output is single-line JSON so Vercel / Docker log drains can parse it.
 * Never pass passwords, tokens, API keys or personal data into `context`.
 */
type Level = "info" | "warn" | "error";

const REDACTED_KEYS = [
  "password",
  "token",
  "secret",
  "apikey",
  "api_key",
  "authorization",
  "access_token",
  "refresh_token",
  "key",
];

export function redact(context: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(context)) {
    out[k] = REDACTED_KEYS.some((needle) => k.toLowerCase().includes(needle))
      ? "[redacted]"
      : v;
  }
  return out;
}

function emit(level: Level, event: string, context: Record<string, unknown> = {}) {
  const line = JSON.stringify({
    level,
    event,
    time: new Date().toISOString(),
    ...redact(context),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
  return line;
}

export const logger = {
  info: (event: string, context?: Record<string, unknown>) => emit("info", event, context),
  warn: (event: string, context?: Record<string, unknown>) => emit("warn", event, context),
  error: (event: string, context?: Record<string, unknown>) => emit("error", event, context),
};
