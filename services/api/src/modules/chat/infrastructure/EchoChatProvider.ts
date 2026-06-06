import type { Message } from "@dreamai/contracts";
import type { IChatProviderPort } from "../ports/IChatProviderPort.js";

/**
 * Stub provider - no LLM. Echoes the last user message word-by-word
 * with a small delay so the SSE streaming path can be exercised.
 */
export class EchoChatProvider implements IChatProviderPort {
    async *streamCompletion(history: readonly Message[]): AsyncIterable<string> {
        const lastUser = history.findLast((m) => m.role === "user");
        const reply = lastUser ? `Echo: "${lastUser.content}" (stub - no real model connected yet.)` : "Hello! This is an echo stub; no real model is connected yet.";

        for (const word of reply.split(" ")) {
            await delay(60);
            yield `${word} `;
        }
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}