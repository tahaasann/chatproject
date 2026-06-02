import type { Message } from "@dreamai/contracts";

/**
 * Outbound port: streams assistant tokens for a message history.
 */
export interface IChatProviderPort {
    streamCompletion(history: readonly Message[]): AsyncIterable<string>;
}