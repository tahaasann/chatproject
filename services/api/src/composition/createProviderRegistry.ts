// import type { ProviderId } from "@dreamai/contracts";
import { env } from "../config/env.js";
import { EchoChatProvider } from "../modules/chat/infrastructure/EchoChatProvider.js";
import { OpenAIChatProvider } from "../modules/chat/infrastructure/OpenAIChatProvider.js";
import { ProviderRegistry } from "../modules/providers/infrastructure/ProviderRegistry.js";
import type { IChatProviderPort } from "../modules/providers/ports/IChatProviderPort.js";
import type { IProviderRegistryPort } from "../modules/providers/ports/IProviderRegistryPort.js";

export function createProviderRegistry(): IProviderRegistryPort {
    const registry = new ProviderRegistry();

    registry.register("openai", createOpenAiProvider());

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