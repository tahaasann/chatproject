import { describe, expect, it } from "vitest";
import { createMessage } from "./Message.js";

describe("createMessage", () => {
    const base = { conversationId: "c1", role: "user" as const };

    it("assigns an id, timestamp and trims content", () => {
        const message = createMessage({ ...base, content: "  hello  " });
        expect(message.id).toBeTruthy();
        expect(message.createdAt).toBeTruthy();
        expect(message.content).toBe("hello");
        expect(message.conversationId).toBe("c1");
        expect(message.role).toBe("user");
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