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