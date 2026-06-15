import { http, HttpResponse } from "msw";

const sseBody = [
    'data: {"id":"chatcmpl-test","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
    'data: {"id":"chatcmpl-test","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}\n\n',
    'data: {"id":"chatcmpl-test","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n',
    "data: [DONE]\n\n",
].join("");

export const openAiHappyPathHandler = http.post(
    "https://api.openai.com/v1/chat/completions",
    () => 
        HttpResponse.text(sseBody, {
            headers: {
                "Content-Type": "text/event-stream",
            },
        }),
);