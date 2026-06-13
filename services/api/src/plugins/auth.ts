import type { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { DEV_FALLBACK_USER_ID, env, isSupabaseEnabled } from "../config/env.js";

declare module "fastify" {
    interface FastifyRequest {
        userId: string;
        accessToken?: string;
    }

    interface FastifyInstance {
        authenticate: (
            request: FastifyRequest,
            reply: FastifyReply,
        ) => Promise<void>;
    }
}

export const authPlugin = fp(async (app) => {
    const jwks = isSupabaseEnabled
        ? createRemoteJWKSet(
            new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
        )
        : null;

    app.decorate(
        "authenticate",
        async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            if (!isSupabaseEnabled || !jwks) {
                request.userId = DEV_FALLBACK_USER_ID;
                return;
                /** 
                return reply.code(503).send({
                    code: "auth.not_configured",
                    message: "Auth is not configured.",
                });
                */
            }

            const header = request.headers.authorization;
            if (!header?.startsWith("Bearer ")) {
                return reply.code(401).send({
                    code: "auth.missing_token",
                    message: "Unauthorized.",
                });
            }

            const token = header.slice("Bearer ".length);

            try {
                const { payload } = await jwtVerify(token, jwks, {
                    algorithms: ["ES256"],
                });

                if (!payload.sub) {
                    return reply.code(401).send({
                        code: "auth.invalid_token",
                        message: "Unauthorized.",
                    });
                }

                request.userId = payload.sub;
                request.accessToken = token;
            } catch {
                return reply.code(401).send({
                    code: "auth.invalid_token",
                    message: "Unauthorized.",
                });
            }
        },
    );
});
