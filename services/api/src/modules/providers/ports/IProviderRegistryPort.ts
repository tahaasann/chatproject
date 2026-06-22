import type { ProviderId } from "@dreamai/contracts";
import type { IChatProviderPort } from "./IChatProviderPort.js";

export interface IProviderRegistryPort {
    register(id: ProviderId, provider: IChatProviderPort): void;
    resolve(id: ProviderId): IChatProviderPort | undefined;
    list(): readonly ProviderId[];
}