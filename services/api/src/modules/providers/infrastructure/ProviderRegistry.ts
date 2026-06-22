import type { ProviderId } from "@dreamai/contracts";
import type { IChatProviderPort } from "../ports/IChatProviderPort.js";
import type { IProviderRegistryPort } from "../ports/IProviderRegistryPort.js";

export class ProviderRegistry implements IProviderRegistryPort {
    private readonly providers = new Map<ProviderId, IChatProviderPort>();

    register(id: ProviderId, provider: IChatProviderPort): void {
        this.providers.set(id, provider);
    }

    resolve(id: ProviderId): IChatProviderPort | undefined {
        return this.providers.get(id);
    }

    list(): readonly ProviderId[] {
        return [...this.providers.keys()];
    }
}