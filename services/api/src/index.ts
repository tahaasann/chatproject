import "./loadEnv.js";
import { env } from "./config/env.js";
import { buildServer } from "./server.js";

async function main(): Promise<void> {
  const app = await buildServer();

  try {
    await app.listen({ host: env.HOST, port: env.PORT });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      app.log.info(`Received ${signal}, shutting down gracefully`);

      const forceShutdownTimeout = setTimeout(() => {
        app.log.error("Graceful shutdown timed out, forcing exit");
        process.exit(1);
      }, 10_000);

      void app.close().then(() => {
        clearTimeout(forceShutdownTimeout);
        app.log.info("Graceful shutdown completed");
        process.exit(0);
      });
    });
  }
}

void main();
