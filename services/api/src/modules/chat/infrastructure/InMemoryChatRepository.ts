import { randomUUID } from "node:crypto";
import type { Message } from "@dreamai/contracts";
import type { 
    Conversation,
    IChatRepositoryPort,
} from "../ports/IChatRepositoryPort.js";


/**
 * Dev/test repository. No RLS - use only for tests and no-Supabase fallback.
 */
export class InMemoryChatRepository implements IChatRepositoryPort {
    private readonly conversations = new Map<string, Conversation>();
    private readonly messagesByConversation = new Map<string, Message[]>();
    private readonly messagesById = new Map<string, Message>();

    async createConversation(input: { userId: string; title?: string | null; }): Promise<Conversation> {
        const now = new Date().toISOString();
        const conversation: Conversation = {
            id: randomUUID(),
            userId: input.userId,
            title: input.title ?? null,
            createdAt: now,
            updatedAt: now,
        };
        this.conversations.set(conversation.id, conversation);
        return conversation;
    }

    async saveMessage(message: Message): Promise<void> {
        const list = this.messagesByConversation.get(message.conversationId) ?? [];
        list.push(message);
        this.messagesByConversation.set(message.conversationId, list);
        this.messagesById.set(message.id, message);
    }

    async updateMessageContent(messageId: string, content: string): Promise<void> {
        const message = this.messagesById.get(messageId);
        if (message) {
            message.content = content;
        }
    }

    async listMessages(conversationId: string): Promise<readonly Message[]> {
        return this.messagesByConversation.get(conversationId) ?? [];
    }

    async findMessage(messageId: string): Promise<Message | undefined> {
        return this.messagesById.get(messageId);
    }
}