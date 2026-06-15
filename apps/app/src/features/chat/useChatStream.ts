import type { SendMessageResult, StreamEvent } from "@dreamai/contracts";
import { useCallback, useRef, useState } from "react";
import { useAuth } from "../auth/AuthProvider.js";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface UseChatStream {
    messages: ChatMessage[];
    isStreaming: boolean;
    error: string | null;
    send: (text: string) => Promise<void>;
}

export function useChatStream(): UseChatStream {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const conversationId = useRef<string | null>(null);
    const { session } = useAuth();

    const send = useCallback(async (text: string) => {
        const content = text.trim();
        if (content.length === 0 || isStreaming) {
            return;
        }
        
        const accessToken = session?.access_token;
        if (!accessToken) {
            setError("Not authenticated");
            return;
        }

        setError(null);
        setIsStreaming(true);

        const localUserId = crypto.randomUUID();
        setMessages((prev) => [...prev, { id: localUserId, role: "user", content }]);

        try {
            const postRes = await fetch("/v1/chat/messages", {
                method: "POST",
                headers: { "content-type": "application/json", "authorization": `Bearer ${accessToken}` },
                body: JSON.stringify({
                    content,
                    conversationId: conversationId.current ?? undefined,
                }),
            });

            if (!postRes.ok) {
                throw new Error(`POST failed: ${postRes.status}`);
            }

            const result = (await postRes.json()) as SendMessageResult;
            conversationId.current = result.conversationId;

            const assistantId = result.assistantMessageId;
            setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" },

            ]);

            const streamRes = await fetch(`/v1/chat/stream/${assistantId}`, {
                headers: { accept: "text/event-stream", "authorization": `Bearer ${accessToken}` },
            });

            if (!streamRes.ok || !streamRes.body) {
                throw new Error(`Stream failed: ${streamRes.status}`);
            }

            await consumeSse(streamRes.body, (evt) => {
                if (evt.type === "token") {
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantId ? { ...m, content: m.content + evt.value } : m,
                        ),
                    );
                } else if (evt.type === "error") {
                    setError(evt.message);
                }
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsStreaming(false);
        }
    }, [isStreaming, session]);

    return { messages, isStreaming, error, send };
}

async function consumeSse(body: ReadableStream<Uint8Array>, onEvent: (evt: StreamEvent) => void): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for(;;) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        buffer += decoder.decode(value, { stream: true });

        let separatorIndex = buffer.indexOf("\n\n");
        while (separatorIndex !== -1) {
            const frame = buffer.slice(0, separatorIndex);
            buffer = buffer.slice(separatorIndex + 2);

            for (const line of frame.split("\n")) {
                if (line.startsWith("data:")) {
                    const payload = line.slice(5).trim();
                    if (payload.length > 0) {
                        try {
                            onEvent(JSON.parse(payload) as StreamEvent);
                        } catch {
                            // Ignore malformed frames (heartbeats).
                        }
                    }
                }
            }

            separatorIndex = buffer.indexOf("\n\n");
        }
    }
}