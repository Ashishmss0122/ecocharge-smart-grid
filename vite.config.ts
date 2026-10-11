// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Docker builds set DOCKER_NITRO_PRESET=node-server so the same source tree can be
// packaged as a plain Node server image. Unset => Lovable/Vercel default target.
// Vercel sets VERCEL=1 during builds; without this the Lovable default (cloudflare)
// output is produced, which Vercel cannot serve as SSR functions.
const dockerPreset =
  process.env["DOCKER_NITRO_PRESET"] ?? (process.env["VERCEL"] ? "vercel" : undefined);

export default defineConfig({
  ...(dockerPreset ? { nitro: { preset: dockerPreset } } : {}),
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
