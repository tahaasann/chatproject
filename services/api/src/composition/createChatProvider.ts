import { env } from "../config/env.js";
import { EchoChatProvider } from "../modules/chat/infrastructure/EchoChatProvider.js";
import { createProviderRegistry } from "./createProviderRegistry.js";

const registry = createProviderRegistry();

export function createChatProvider(){
    if (env.CHAT_PROVIDER === "echo" ) {
        return new EchoChatProvider();
    }

    const provider = registry.resolve(env.CHAT_PROVIDER);
    return provider ?? new EchoChatProvider();
}
