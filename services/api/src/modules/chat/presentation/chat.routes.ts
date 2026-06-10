import type { FastifyInstance } from "fastify";
import { SendMessageInput, type StreamEvent } from "@dreamai/contracts";
import { DEV_FALLBACK_USER_ID } from "../../../config/env.js";
import { SendMessageUseCase } from "../application/SendMessageUseCase.js";
import { EchoChatProvider } from "../infrastructure/EchoChatProvider.js";
import { InMemoryChatRepository } from "../infrastructure/InMemoryChatRepository.js";

export async function chatRoutes(app: FastifyInstance): Promise<void> {
    const repo = new InMemoryChatRepository();
    const provider = new EchoChatProvider();

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
        const result = await useCase.execute(parsed.data, {
            userId: DEV_FALLBACK_USER_ID,
        });

        return reply.code(201).send(result);
    });

    app.get<{ Params: { assistantMessageId: string } }>(
        "/v1/chat/stream/:assistantMessageId",
        { sse: true },
        async (request, reply) => {
            if (!reply.sse) {
                return reply.code(406).send({
                    code: "chat.stream.not_acceptable",
                    message: "This endpoint requires Accept: text/event-stream.",
                });
            }

            const { assistantMessageId } = request.params;
            const assistant = await repo.findMessage(assistantMessageId);

            if (!assistant) {
                const errorEvent: StreamEvent = {
                    type: "error",
                    code: "chat.message.not_found",
                    message: "Assistant message not found.",
                };
                await reply.sse.send({ event: "message", data: errorEvent });
                return;
            }

            const history = await repo.listMessages(assistant.conversationId);
            let full = "";

            try {
                const meta: StreamEvent = {
                    type: "meta",
                    assistantMessageId,
                    conversationId: assistant.conversationId,
                };
                await reply.sse.send({ event: "message", data: meta });

                for await (const token of provider.streamCompletion(history)) {
                    if (!reply.sse.isConnected) {
                        break;
                    }
                    full += token;
                    const tokenEvent: StreamEvent = { type: "token", value: token };
                    await reply.sse.send({ event: "message", data: tokenEvent });
                }

                if (reply.sse.isConnected) {
                    const done: StreamEvent = { type: "done", assistantMessageId };
                    await reply.sse.send({ event: "message", data: done });
                }
            } catch (err) {
                request.log.warn({ err, assistantMessageId }, "chat stream aborted");
            }

            if (full.trim().length > 0) {
                await repo
                    .updateMessageContent(assistantMessageId, full.trim())
                    .catch((err: unknown) => {
                        request.log.warn(
                            { err, assistantMessageId },
                            "persist assistant content failed",
                        );
                    });
            }
        },
    );
}
