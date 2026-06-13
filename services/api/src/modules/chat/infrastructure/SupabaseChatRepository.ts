import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, Message, MessageRole } from "@dreamai/contracts";
import type { IChatRepositoryPort } from "../ports/IChatRepositoryPort.js";

type ConversationRow = {
    id: string;
    user_id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
};

type MessageRow = {
    id: string;
    conversation_id: string;
    user_id: string;
    role: MessageRole;
    content: string;
    created_at: string;
};

function toConversation(row: ConversationRow): Conversation {
    return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function toMessage(row: MessageRow): Message {
    return {
        id: row.id,
        conversationId: row.conversation_id,
        userId: row.user_id,
        role: row.role,
        content: row.content,
        createdAt: row.created_at,
    };
}

export function createSupabaseChatRepository(input: {
    url: string;
    anonKey: string;
    accessToken: string;
}): IChatRepositoryPort {
    const client: SupabaseClient = createClient(input.url, input.anonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${input.accessToken}`,
            }
        }
    });

    return {
        async createConversation(opts) {
            const { data, error } = await client.from("conversations").insert({
                user_id: opts.userId,
                title: opts.title ?? null,
            })
            .select("id, user_id, title, created_at, updated_at")
            .single();

            if(error) {
                throw new Error(`chat.conversation.create_failed: ${error.message}`);
            }

            return toConversation(data as ConversationRow);
        },

        async saveMessage(message) {
            const { error } = await client.from("messages").insert({
                id: message.id,
                conversation_id: message.conversationId,
                user_id: message.userId,
                role: message.role,
                content: message.content,
                created_at: message.createdAt,
            });

            if(error) {
                throw new Error(`chat.message.save_failed: ${error.message}`);
            }
        },

        async updateMessageContent(messageId, content) {
            const { error } = await client.from("messages").update({ content }).eq("id", messageId);

            if(error) {
                throw new Error(`chat.message.update_failed: ${error.message}`);
            }
        },

        async listMessages(conversationId) {
            const { data, error } = await client.from("messages").select("id, conversation_id, user_id, role, content, created_at").eq("conversation_id", conversationId).order("created_at", { ascending: true });

            if(error) {
                throw new Error(`chat.message.list_failed: ${error.message}`);
            }

            return (data as MessageRow[]).map(toMessage);
        },

        async findMessage(messageId) {
            const { data, error } = await client.from("messages").select("id, conversation_id, user_id, role, content, created_at").eq("id", messageId).single();

            if(error) {
                throw new Error(`chat.message.find_failed: ${error.message}`);
            }

            return data ? toMessage(data as MessageRow) : undefined;
        },
    };
}