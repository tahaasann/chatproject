import type { FastifyInstance, FastifyRequest } from "fastify";
import { SendMessageInput, type StreamEvent } from "@dreamai/contracts";
import { env, isSupabaseEnabled } from "../../../config/env.js";
import { SendMessageUseCase } from "../application/SendMessageUseCase.js";
import { InMemoryChatRepository } from "../infrastructure/InMemoryChatRepository.js";
import { createSupabaseChatRepository } from "../infrastructure/SupabaseChatRepository.js";
import type { IChatRepositoryPort } from "../ports/IChatRepositoryPort.js";
import { createChatProvider } from "../../../composition/createChatProvider.js";

export async function chatRoutes(app: FastifyInstance): Promise<void> {
    const provider = createChatProvider();
    const inMemoryRepo = new InMemoryChatRepository();

    function repoFor(request: FastifyRequest): IChatRepositoryPort {
        if (isSupabaseEnabled) {
            if (!request.accessToken) {
                throw new Error("chat.auth.token_required");
            }
            return createSupabaseChatRepository({
                url: env.SUPABASE_URL!,
                anonKey: env.SUPABASE_ANON_KEY!,
                accessToken: request.accessToken,
            });
        }
        return inMemoryRepo;
    }

    app.post("/v1/chat/messages", { preHandler: app.authenticate }, async (request, reply) => {
        const parsed = SendMessageInput.safeParse(request.body);
        if (!parsed.success) {
            return reply.code(400).send({
                code: "chat.message.invalid",
                message: "Invalid message payload.",
                issues: parsed.error.flatten().fieldErrors,
            });
        }

        let result;
        try {
            const useCase = new SendMessageUseCase(repoFor(request));
            result = await useCase.execute(parsed.data, { userId: request.userId });
        } catch (err) {
            if (err instanceof Error && err.message === "chat.conversation.forbidden") {
                return reply.code(403).send({
                    code: "chat.conversation.forbidden",
                    message: "Conversation not found or access denied.",
                });
            }
            throw err;
        }

        return reply.code(201).send(result);
    });

    app.get<{ Params: { assistantMessageId: string } }>(
        "/v1/chat/stream/:assistantMessageId",
        { sse: true, preHandler: app.authenticate },
        async (request, reply) => {
            if (!reply.sse) {
                return reply.code(406).send({
                    code: "chat.stream.not_acceptable",
                    message: "This endpoint requires Accept: text/event-stream.",
                });
            }

            let repo: IChatRepositoryPort;
            try {
                repo = repoFor(request);
            } catch (err) {
                const errorEvent: StreamEvent = {
                    type: "error",
                    code: "chat.auth.token_required",
                    message: "Authentication required.",
                };
                await reply.sse.send({ event: "message", data: errorEvent });
                return;
            }

            const { assistantMessageId } = request.params;
            const assistant = await repo.findMessage(assistantMessageId);

            if (!assistant || assistant.userId !== request.userId) {
                const errorEvent: StreamEvent = {
                    type: "error",
                    code: "chat.message.not_found",
                    message: "Assistant message not found.",
                };
                await reply.sse.send({ event: "message", data: errorEvent });
                return;
            }

            const history = await repo.listMessages(assistant.conversationId);

            /**
            * historyToSend Nedir? (Hayati Hata Çözümü - .slice(0, -1) Dehası 🚨)
            * Veritabanından gelen geçmiş mesaj dizisinin en sonunda bizim rezerve ettiğimiz
            * asistan yer tutucu mesajı ("…") yer alır. OpenAI API'sinin patlamasını önlemek ve
            * son mesajın kesinlikle "user" (kullanıcı) olmasını garanti etmek için,
            * bu son yer tutucu elemanı diziden kırpıp (çıkartıp) yapay zekaya öyle gönderiyoruz.
            */
            const historyToSend = history.slice(0, -1);

            let full = "";

            const streamStartedAt = performance.now();
            let metaSent = false;

            try {
                for await (const token of provider.streamCompletion(historyToSend)) {
                    if (!reply.sse.isConnected) break;
                    if (!metaSent) {
                        const ttftMs = Math.round(performance.now() - streamStartedAt);
                        request.log.info({ ttftMs, assistantMessageId }, "chat.stream.ttft");
                        const meta: StreamEvent = {
                            type: "meta",
                            assistantMessageId,
                            conversationId: assistant.conversationId,
                            ttftMs,
                        };
                        await reply.sse.send({ event: "message", data: meta });
                        metaSent = true;
                    }

                    full += token;
                    await reply.sse.send({
                        event: "message",
                        data: { type: "token", value: token } satisfies StreamEvent,
                    });
                }

                if (reply.sse.isConnected && !metaSent) {
                    const meta: StreamEvent = {
                        type: "meta",
                        assistantMessageId,
                        conversationId: assistant.conversationId,
                        ttftMs: Math.round(performance.now() - streamStartedAt),
                    };
                    await reply.sse.send({ event: "message", data: meta });
                }

                if (reply.sse.isConnected) {
                    await reply.sse.send({
                        event: "message",
                        data: { type: "done", assistantMessageId } satisfies StreamEvent,
                    });
                }
            } catch (err) {
                request.log.warn({ err, assistantMessageId }, "chat stream aborted");


                if (reply.sse.isConnected) {
                    const errorEvent: StreamEvent = {
                        type: "error",
                        code: "chat.stream.failed",
                        message: "Assistant stream failed."
                    };
                    await reply.sse.send({ event: "message", data: errorEvent });
                }
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
