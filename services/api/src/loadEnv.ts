import { fileURLToPath } from "node:url";
import path from "node:path";

const apiRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

// Loads services/api/.env into process.env before config/env.ts runs.
// Node 24+ native API — no dotenv package. No-op when the file is absent.
try {
  process.loadEnvFile(path.join(apiRoot, ".env"));
} catch {
  // Rely on ambient env (Docker, Fly.io, CI).
}
