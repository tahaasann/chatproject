import { http, HttpResponse } from "msw";

function geminiChunk(text: string): string {
    return `data: ${JSON.stringify({
        candidates: [
            {
                content: {
                    parts: [{ text }],
                    role: "model",
                },
            },
        ],
    })}\n\n`;
}

const sseBody = [geminiChunk("Hello"), geminiChunk(" world")].join("");

export const geminiHappyPathHandler = http.post(
    /https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/.*:streamGenerateContent/,
    () =>
        HttpResponse.text(sseBody, {
            headers: {
                "Content-Type": "text/event-stream",
            },
        }),
);
