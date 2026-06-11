import { describe, expect, it } from "vitest";
import { createMessage } from "../domain/Message.js";
import { InMemoryChatRepository } from "./InMemoryChatRepository.js";

describe("InMemoryChatRepository", () => {
    const userId = "11111111-1111-4111-8111-111111111111";

    it("creates a conversation owned by the user", async () => {
        const repo = new InMemoryChatRepository();
        const convo = await repo.createConversation({ userId, title: "hi" });
        expect(convo.userId).toBe(userId);
        expect(convo.title).toBe("hi");
        expect(convo.id).toBeTruthy();
    });

    it("persists and lists messages in insertion order", async () => {
        const repo = new InMemoryChatRepository();
        const convo = await repo.createConversation({ userId });
        const m1 = createMessage({
            conversationId: convo.id,
            userId,
            role: "user",
            content: "first",
        });
        const m2 = createMessage({
            conversationId: convo.id,
            userId,
            role: "assistant",
            content: "second",
        });
        await repo.saveMessage(m1);
        await repo.saveMessage(m2);

        const messages = await repo.listMessages(convo.id);
        expect(messages.map((m) => m.content)).toEqual(["first", "second"]);
    });

    it("updates message content by id", async () => {
        const repo = new InMemoryChatRepository();
        const convo = await repo.createConversation({ userId });
        const m = createMessage({
            conversationId: convo.id,
            userId,
            role: "assistant",
            content: "…",
        });
        await repo.saveMessage(m);
        await repo.updateMessageContent(m.id, "done");

        const found = await repo.findMessage(m.id);
        expect(found?.content).toBe("done");
    });

    it("returns undefined for an unknown message id", async () => {
        const repo = new InMemoryChatRepository();
        expect(await repo.findMessage("nope")).toBeUndefined();
    });
});