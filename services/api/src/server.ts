import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastifySse from "@fastify/sse";
import Fastify from "fastify";
import { env } from "./config/env.js";
import { chatRoutes } from "./modules/chat/presentation/chat.routes.js";

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

  await app.register(fastifySse.default, { heartbeatInterval: 15000 });
  
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, "unhandled route error");
    if (reply.sent || reply.raw.headersSent) {
      return;
    };
    void reply.code(500).send({ code: "internal_error", message: "Internal server error." });
  });
  
  await app.register(chatRoutes);
  
  app.get("/healthz", async () => ({
    status: "ok",
    uptime: process.uptime(),
    version: "0.0.1",
  }));


  return app;
}
