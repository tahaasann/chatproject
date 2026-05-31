import { z } from "zod";

/** Roles a chat message can take. */
export const MessageRole = z.enum(["user", "assistant", "system"]);
export type MessageRole = z.infer<typeof MessageRole>;

/** A single chat message as stored and exchanged. */
export const MessageSchema = z.object({
    id: z.string(),
    conversationId: z.string(),
    role: MessageRole,
    content: z.string(),
    createdAt: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

/** Body accepted by POST /v1/chat/messages. */
export const SendMessageInput = z.object({
    conversationId: z.string().min(1).optional(),
    content: z.string().trim().min(1).max(8000),
});
export type SendMessageInput = z.infer<typeof SendMessageInput>;

/** Response of POST /v1/chat/messages - ids used to open the SSE stream. */
export const SendMessageResult = z.object({
    conversationId: z.string(),
    userMessageId: z.string(),
    assistantMessageId: z.string(),
});
export type SendMessageResult = z.infer<typeof SendMessageResult>;