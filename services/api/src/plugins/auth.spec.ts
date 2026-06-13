import Fastify from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../config/env.js", () => ({
    env: {
        SUPABASE_URL: "http://127.0.0.1:54321",
        SUPABASE_ANON_KEY: "test-anon-key",
    },
    isSupabaseEnabled: true,
}));

import { authPlugin } from "./auth.js";

describe("authPlugin", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns 401 when Authorization header is missing", async () => {
        const app = Fastify();
        await app.register(authPlugin);

        app.get("/protected", { preHandler: app.authenticate }, async () => ({
            ok: true,
        }));

        const res = await app.inject({ method: "GET", url: "/protected" });
        expect(res.statusCode).toBe(401);

        await app.close();
    });
});