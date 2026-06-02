import Fastify from "fastify";
import { env } from "./config/env.js";

export async function buildServer() {
  const app = Fastify({
    logger:
      env.NODE_ENV === "development"
        ? { level: "debug" }
        : { level: "info" },
  });

  app.get("/healthz", async () => ({
    status: "ok",
    uptime: process.uptime(),
    version: "0.0.1",
  }));

  return app;
}
