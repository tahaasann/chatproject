// import type { ProviderId } from "@dreamai/contracts";
import { env } from "../config/env.js";
import { EchoChatProvider } from "../modules/chat/infrastructure/EchoChatProvider.js";
import { OpenAIChatProvider } from "../modules/chat/infrastructure/OpenAIChatProvider.js";
import { AnthropicChatProvider } from "../modules/providers/infrastructure/anthropic/AnthropicChatProvider.js";
import { ProviderRegistry } from "../modules/providers/infrastructure/ProviderRegistry.js";
import type { IChatProviderPort } from "../modules/providers/ports/IChatProviderPort.js";
import type { IProviderRegistryPort } from "../modules/providers/ports/IProviderRegistryPort.js";

export function createProviderRegistry(): IProviderRegistryPort {
    const registry = new ProviderRegistry();

    registry.register("openai", createOpenAiProvider());
    registry.register("anthropic", createAnthropicProvider());

    return registry;
}

function createOpenAiProvider(): IChatProviderPort {
    if (env.OPENAI_API_KEY) {
        return new OpenAIChatProvider({
            apiKey: env.OPENAI_API_KEY,
            model: env.OPENAI_MODEL,
        });
    }
    return new EchoChatProvider();
}

function createAnthropicProvider(): IChatProviderPort {
    if (env.ANTHROPIC_API_KEY) {
        return new AnthropicChatProvider({
            apiKey: env.ANTHROPIC_API_KEY,
            model: env.ANTHROPIC_MODEL,
        });
    }
    return new EchoChatProvider();
}