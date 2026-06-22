import type { Message } from "@dreamai/contracts";
import OpenAI from "openai";
import type { IChatProviderPort } from "../../providers/ports/IChatProviderPort.js";

export interface OpenAIChatProviderDeps{
    apiKey: string;
    model: string;
    client?: OpenAI;
}

export class OpenAIChatProvider implements IChatProviderPort {
    private readonly client: OpenAI;
    private readonly model: string;

    constructor(deps: OpenAIChatProviderDeps) {
        this.client = deps.client ?? new OpenAI({ apiKey: deps.apiKey });
        this.model = deps.model;
    }

    async *streamCompletion(history: readonly Message[]): AsyncIterable<string> {
        const messages = history.map((message) => ({
            role: message.role,
            content: message.content,
        }));

        const stream = await this.client.chat.completions.create({
            model: this.model,
            messages,
            stream: true,
        });

        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta.content ?? "";
            if (token) {
                yield token;
            }
        }
    }
}