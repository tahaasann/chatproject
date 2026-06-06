import type { FastifyInstance } from "fastify";
import { SendMessageInput } from "@dreamai/contracts";
import { DEV_FALLBACK_USER_ID } from '../../../config/env.js';
import { SendMessageUseCase } from '../application/SendMessageUseCase.js';
import { InMemoryChatRepository } from '../infrastructure/InMemoryChatRepository.js';
import { request } from "http";

export async function chatRoutes(app: FastifyInstance): Promise<void> {
    const repo = new InMemoryChatRepository();

    app.post("/v1/chat/messages", async (request, reply) => {
        const parsed = SendMessageInput.safeParse(request.body);
        if (!parsed.success) {
            return reply.code(400).send({
                code: "chat.message.invalid",
                message: "Invalid message payload.",
                issues: parsed.error.flatten().fieldErrors,
            });
        }

        const useCase = new SendMessageUseCase(repo);
        const result = await useCase.execute(parsed.data, { userId: DEV_FALLBACK_USER_ID });

        return reply.code(201).send(result);
    })
}