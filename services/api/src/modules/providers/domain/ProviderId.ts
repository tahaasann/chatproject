import { ProviderIdSchema, type ProviderId } from "@dreamai/contracts";

export function parseProviderId(value: string): ProviderId | undefined {
    const parsed = ProviderIdSchema.safeParse(value);
    return parsed.success ? parsed.data : undefined;
}