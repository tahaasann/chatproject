import { describe, expect, it } from "vitest";
import { InMemoryChatRepository } from "../infrastructure/InMemoryChatRepository.js";
import { SendMessageUseCase } from "./SendMessageUseCase.js";

describe("SendMessageUseCase", () => {
  const userId = "11111111-1111-1111-1111-111111111111";

  it("creates a conversation and saves user + assistant placeholder", async () => {
    const repo = new InMemoryChatRepository();
    const useCase = new SendMessageUseCase(repo);

    const result = await useCase.execute({ content: "hello" }, { userId });

    expect(result.conversationId).toBeTruthy();
    expect(result.userMessageId).not.toBe(result.assistantMessageId);

    const messages = await repo.listMessages(result.conversationId);
    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({ role: "user", content: "hello" });
    expect(messages[1]).toMatchObject({ role: "assistant", content: "…" });
  });

  it("reuses an existing conversation id", async () => {
    const repo = new InMemoryChatRepository();
    const useCase = new SendMessageUseCase(repo);
    const convo = await repo.createConversation({ userId });

    const result = await useCase.execute(
      { conversationId: convo.id, content: "hi" },
      { userId },
    );

    expect(result.conversationId).toBe(convo.id);
    const messages = await repo.listMessages(convo.id);
    expect(messages).toHaveLength(2);
  });

  it("persists user and assistant messages with distinct ids", async () => {
    const repo = new InMemoryChatRepository();
    const useCase = new SendMessageUseCase(repo);

    const result = await useCase.execute({ content: "ids" }, { userId });

    const user = await repo.findMessage(result.userMessageId);
    const assistant = await repo.findMessage(result.assistantMessageId);
    expect(user?.role).toBe("user");
    expect(assistant?.role).toBe("assistant");
    expect(user?.id).not.toBe(assistant?.id);
  });
});