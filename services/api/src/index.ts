import { env } from "./config/env";
import { buildServer } from "./server";

async function main(): Promise<void> {
    const app = await buildServer();

    try {
        await app.listen({ host: env.HOST, port: env.PORT });
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }

    for (const signal of ["SIGINT", "SIGTERM"] as const) {
        process.on(signal, () => {
            app.log.info(`Received ${signal}, shutting down`);
            void app.close().then(() => process.exit(0));
        });
    }
}

void main();