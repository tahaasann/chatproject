import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@dreamai/contracts";
import type { IChatProviderPort } from "../../ports/IChatProviderPort.js";

export interface AnthropicChatProviderDeps {
    apiKey: string;
    model: string;
    client?: Anthropic;
}

export class AnthropicChatProvider implements IChatProviderPort {
    private readonly client: Anthropic;
    private readonly model: string;

    constructor(deps: AnthropicChatProviderDeps) {
        this.client = deps.client ?? new Anthropic({ apiKey: deps.apiKey });
        this.model = deps.model;
    }

    async *streamCompletion(history: readonly Message[]): AsyncIterable<string> {
        const systemParts = history
            .filter((m) => m.role === "system")
            .map((m) => m.content);
        const system = systemParts.length > 0 ? systemParts.join("\n") : undefined;

        const messages = history
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            }));

        const stream = this.client.messages.stream({
            model: this.model,
            max_tokens: 1024,
            ...(system ? { system } : {}),
            messages,
        });

        for await (const event of stream) {
            if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
            ) {
                yield event.delta.text;
            }
        }
    }
}