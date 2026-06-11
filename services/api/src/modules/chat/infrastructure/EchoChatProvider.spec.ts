import type { Message } from "@dreamai/contracts";
import { describe, expect, it } from "vitest";
import { EchoChatProvider } from "./EchoChatProvider.js";

function userMessage(content: string): Message {
    return {
        id: "m1",
        conversationId: "c1",
        userId: "u1",
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

describe("EchoChatProvider", () => {
    it("echoes the last user message content", async () => {
        const provider = new EchoChatProvider();
        const out = await collect(provider.streamCompletion([userMessage("ping pong")]));
        expect(out).toContain("ping pong");
    });

    it("yields a greeting when there is no user message", async () => {
        const provider = new EchoChatProvider();
        const out = await collect(provider.streamCompletion([]));
        expect(out.trim().length).toBeGreaterThan(0);
    })
})