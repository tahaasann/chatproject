import { z } from "zod";

/** Roles a chat message can take. */
export const MessageRole = z.enum(["user", "assistant", "system"]);
export type MessageRole = z.infer<typeof MessageRole>;

/** A single chat message as stored and exchanged. */
export const MessageSchema = z.object({
    id: z.string().uuid(),
    conversationId: z.string().uuid(),
    userId: z.string().uuid(),
    role: MessageRole,
    content: z.string(),
    createdAt: z.string().datetime(),
});
export type Message = z.infer<typeof MessageSchema>;

/** A conversation owned by a user. */
export const ConversationSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    title: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

/** Body accepted by POST /v1/chat/messages. */
export const SendMessageInput = z.object({
    conversationId: z.string().uuid().optional(),
    content: z.string().trim().min(1).max(8000),
});
export type SendMessageInput = z.infer<typeof SendMessageInput>;

/** Response of POST /v1/chat/messages - ids used to open the SSE stream. */
export const SendMessageResult = z.object({
    conversationId: z.string().uuid(),
    userMessageId: z.string().uuid(),
    assistantMessageId: z.string().uuid(),
});
export type SendMessageResult = z.infer<typeof SendMessageResult>;

/**
 * Canonical SSE event schema streamed from GET /v1/chat/stream/:id.
 * Discriminated union — every event has a `type`.
 */
export type StreamEvent = | { type: "meta"; assistantMessageId: string; conversationId: string } | { type: "token"; value: string } | { type: "done"; assistantMessageId: string } | { type: "error"; code: string; message: string };