import { z } from "zod";

export const ProviderIdSchema = z.enum([
    "openai",
    "anthropic",
    "google",
    "xai",
    "qwen",
    "zai",
]);
export type ProviderId = z.infer<typeof ProviderIdSchema>;

export const PROVIDER_IDS = ProviderIdSchema.options;