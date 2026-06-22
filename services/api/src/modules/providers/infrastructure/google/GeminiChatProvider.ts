import { GoogleGenAI } from "@google/genai";
import type { Message } from "@dreamai/contracts";
import type { IChatProviderPort } from "../../ports/IChatProviderPort.js";

export interface GeminiChatProviderDeps {
    apiKey: string;
    model: string;
    client?: GoogleGenAI;
}

export class GeminiChatProvider implements IChatProviderPort {
    private readonly client: GoogleGenAI;
    private readonly model: string;

    constructor(deps: GeminiChatProviderDeps) {
        this.client = deps.client ?? new GoogleGenAI({ apiKey: deps.apiKey });
        this.model = deps.model;
    }

    async *streamCompletion(history: readonly Message[]): AsyncIterable<string> {
        const systemParts = history
            .filter((message) => message.role === "system")
            .map((message) => message.content);
        const systemInstruction =
            systemParts.length > 0 ? systemParts.join("\n") : undefined;

        const contents = history
            .filter((message) => message.role === "user" || message.role === "assistant")
            .map((message) => ({
                role: message.role === "assistant" ? "model" : "user",
                parts: [{ text: message.content }],
            }));

        const stream = await this.client.models.generateContentStream({
            model: this.model,
            contents,
            ...(systemInstruction
                ? { config: { systemInstruction } }
                : {}),
        });

        for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
                yield text;
            }
        }
    }
}
