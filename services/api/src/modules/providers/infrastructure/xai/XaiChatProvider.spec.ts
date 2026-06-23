import type { Message } from "@dreamai/contracts";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { xaiHappyPathHandler } from "../../../../test/msw/xai/happyPathHandler.js";
import { XaiChatProvider } from "./XaiChatProvider.js";

const server = setupServer(xaiHappyPathHandler);

function userMessage(content: string): Message {
    return {
        id: "11111111-1111-4111-8111-111111111111",
        conversationId: "22222222-2222-4222-8222-222222222222",
        userId: "33333333-3333-4333-8333-333333333333",
        role: "user",
        content,
        createdAt: new Date().toISOString(),
    };
}

async function collect(stream: AsyncIterable<string>): Promise<string> {
    let out = "";
    for await (const chunk of stream) {
        out += chunk;
    }
    return out;
}

describe("XaiChatProvider", () => {
    beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it("streams tokens from xAI chat completions API", async () => {
        const provider = new XaiChatProvider({
            apiKey: "test-api-key",
            model: "grok-2-latest",
        });

        const out = await collect(provider.streamCompletion([userMessage("ping")]));

        expect(out).toBe("Hello world");
    });
});
