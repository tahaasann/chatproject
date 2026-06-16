import { env } from "../config/env.js";
import { EchoChatProvider } from "../modules/chat/infrastructure/EchoChatProvider.js";
import { OpenAIChatProvider } from "../modules/chat/infrastructure/OpenAIChatProvider.js";
import type { IChatProviderPort } from "../modules/chat/ports/IChatProviderPort.js";

export function createChatProvider(): IChatProviderPort {
    if (env.CHAT_PROVIDER === "openai" && env.OPENAI_API_KEY) {
        return new OpenAIChatProvider({
            apiKey: env.OPENAI_API_KEY,
            model: env.OPENAI_MODEL,
        });
    }

    return new EchoChatProvider();
}
