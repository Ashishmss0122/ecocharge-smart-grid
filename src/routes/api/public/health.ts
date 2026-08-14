import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";

const startedAt = Date.now();

/**
 * GET /api/public/health
 *
 * Liveness + dependency check. Returns 200 when the server is up and the
 * database answers, 503 when the database is unreachable. No secrets and no
 * user data are ever included in the response.
 */
export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
        const key =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

        let database: "up" | "down" | "not_configured" = "not_configured";
        let latencyMs: number | null = null;

        if (url && key) {
          const began = Date.now();
          try {
            const client = createClient(url, key, {
              auth: { persistSession: false, autoRefreshToken: false },
              global: {
                fetch: (input, init) => {
                  const headers = new Headers(init?.headers);
                  headers.set("apikey", key);
                  headers.delete("Authorization");
                  return fetch(input, { ...init, headers });
                },
              },
            });
            const { error } = await client
              .from("stations")
              .select("id", { count: "exact", head: true })
              .limit(1);
            latencyMs = Date.now() - began;
            if (error) {
              database = "down";
              logger.error("health.database", { message: error.message });
            } else {
              database = "up";
            }
          } catch (error) {
            latencyMs = Date.now() - began;
            database = "down";
            logger.error("health.database", {
              message: error instanceof Error ? error.message : "unknown error",
            });
          }
        } else {
          logger.warn("health.database", { message: "database env vars are not configured" });
        }

        const healthy = database !== "down";
        const body = {
          status: healthy ? "ok" : "degraded",
          service: "ecocharge-web",
          uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
          timestamp: new Date().toISOString(),
          checks: { server: "up", database, databaseLatencyMs: latencyMs },
        };

        return new Response(JSON.stringify(body, null, 2), {
          status: healthy ? 200 : 503,
          headers: { "content-type": "application/json", "cache-control": "no-store" },
        });
      },
    },
  },
});
