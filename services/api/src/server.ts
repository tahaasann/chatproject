import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastifySse from "@fastify/sse";
import Fastify from "fastify";
import { env } from "./config/env.js";

export async function buildServer() {
  const app = Fastify({
    logger:
      env.NODE_ENV === "development"
        ? { 
            level: "debug",
            transport: {
              target: "pino-pretty",
              options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" },
            },
          }
        : { level: "info" },
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGINS,
    credentials: true,
  });

  await app.register(fastifySse, { heartbeatInterval: 15000 });
  
  app.get("/healthz", async () => ({
    status: "ok",
    uptime: process.uptime(),
    version: "0.0.1",
  }));

  return app;
}
