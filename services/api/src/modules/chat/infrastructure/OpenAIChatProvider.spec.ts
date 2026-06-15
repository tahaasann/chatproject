import type { Message } from "@dreamai/contracts";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { openAiHappyPathHandler } from "../../../../test/msw/openai/happyPathHandler.js";
import { OpenAIChatProvider } from "./OpenAIChatProvider.js";

const server = setupServer(openAiHappyPathHandler);

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

describe("OpenAIChatProvider", () => {
    beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it("streams tokens from OpenAI chat completions API", async () => {
        const provider = new OpenAIChatProvider({
            apiKey: "test-api-key",
            model: "gpt-4o-mini",
        });

        const out = await collect(provider.streamCompletion([userMessage("ping")]));

        expect(out).toBe("Hello world");
    });
});