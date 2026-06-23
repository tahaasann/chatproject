import type { Message } from "@dreamai/contracts";
import OpenAI from "openai";
import type { IChatProviderPort } from "../../ports/IChatProviderPort.js";

const XAI_BASE_URL = "https://api.x.ai/v1";

export interface XaiChatProviderDeps {
    apiKey: string;
    model: string;
    client?: OpenAI;
}

export class XaiChatProvider implements IChatProviderPort {
    private readonly client: OpenAI;
    private readonly model: string;

    constructor(deps: XaiChatProviderDeps) {
        this.client =
            deps.client ??
            new OpenAI({
                apiKey: deps.apiKey,
                baseURL: XAI_BASE_URL,
            });
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
            const token = chunk.choices[0]?.delta?.content ?? "";
            if (token) {
                yield token;
            }
        }
    }
}
