// Loads services/api/.env into process.env before config/env.ts runs.
// Node 24+ native API — no dotenv package. No-op when the file is absent.
try {
  process.loadEnvFile();
} catch {
  // Rely on ambient env (Docker, Fly.io, CI).
}
