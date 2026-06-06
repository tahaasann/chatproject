import type { SendMessageInput, SendMessageResult } from "@dreamai/contracts";
import { createMessage } from "../domain/Message.js";
import type { IChatRepositoryPort } from "../ports/IChatRepositoryPort.js";

/**
 * Persists the user message and reserves an assistant placeholder.
 * Streamed tokens are produced later by the stream endpoint.
 */
export class SendMessageUseCase {
    constructor(private readonly repo: IChatRepositoryPort) {}

    async execute(input: SendMessageInput, ctx: { userId: string }): Promise<SendMessageResult> {
        let conversationId = input.conversationId;

        if (!conversationId) {
            const conversation = await this.repo.createConversation({
                userId: ctx.userId,
                title: input.content.slice(0, 60),
            });
            conversationId = conversation.id;
        }

        const userMessage = createMessage({
            conversationId,
            role: "user",
            content: input.content,
        });
        await this.repo.saveMessage(userMessage);

        const assistantMessage = createMessage({
            conversationId,
            role: "assistant",
            content: "…",
        });
        await this.repo.saveMessage(assistantMessage);

        return {
            conversationId,
            userMessageId: userMessage.id,
            assistantMessageId: assistantMessage.id,
        };
    }
}