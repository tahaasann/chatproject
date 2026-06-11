import { randomUUID } from "node:crypto";
import type { Message, MessageRole } from "@dreamai/contracts";
    
/**
 * Domain factory for a chat message. Pure: no framework, no I/O.
 */
export function createMessage(params: {
    conversationId: string;
    userId: string;
    role: MessageRole;
    content: string;
}): Message {
    const content = params.content.trim();
    if (content.length === 0) {
        throw new Error("chat.message.empty");
    }

    return {
        id: randomUUID(),
        conversationId: params.conversationId,
        userId: params.userId,
        role: params.role,
        content,
        createdAt: new Date().toISOString(),
    };
}