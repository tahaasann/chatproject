import type { Message } from "@dreamai/contracts";

/** Temporary until T-084 moves Conversation into @dreamai/contracts. */
export type Conversation = {
    id: string;
    userId: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
};

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
}