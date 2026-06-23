import type { Conversation, Message } from "@dreamai/contracts";

/**
 * Outbound port: persistence for conversations and messages.
 */
export interface IChatRepositoryPort {
    createConversation(input: {
        userId: string;
        title?: string | null;
    }): Promise<Conversation>;

    saveMessage(message: Message): Promise<void>;

    updateMessageContent(messageId: string, content: string): Promise<void>;

    listMessages(conversationId: string): Promise<readonly Message[]>;

    findMessage(messageId: string): Promise<Message | undefined>;

    findConversation(conversationId: string): Promise<Conversation | undefined>;
}