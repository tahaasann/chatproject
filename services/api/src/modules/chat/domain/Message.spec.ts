import { describe, expect, it } from "vitest";
import { createMessage } from "./Message.js";

describe("createMessage", () => {
    const CONV_ID = "11111111-1111-4111-8111-111111111111";
    const USER_ID = "22222222-2222-4222-8222-222222222222";
    const base = { conversationId: CONV_ID, userId: USER_ID, role: "user" as const };

    it("assigns an id, timestamp and trims content", () => {
        const message = createMessage({ ...base, content: "  hello  " });
        expect(message.id).toBeTruthy();
        expect(message.createdAt).toBeTruthy();
        expect(message.userId).toBe(base.userId);
        expect(message.content).toBe("hello");
        expect(message.conversationId).toBe(base.conversationId);
        expect(message.role).toBe(base.role);
    });

    it("throws on empty/whitespace content", () => {
        expect(() => createMessage({ ...base, content: "   " })).toThrow("chat.message.empty");
    });

    it("creates unique ids", () => {
        const a = createMessage({ ...base, content: "x" });
        const b = createMessage({ ...base, content: "y" });
        expect(a.id).not.toBe(b.id);
    });
});