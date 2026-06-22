import { http, HttpResponse } from "msw";

const sseBody = [
    'event: message_start\n',
    'data: {"type":"message_start","message":{"id":"msg_123","type":"message","role":"assistant","content":[],"model":"claude-3-5-haiku-latest","stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":10,"output_tokens":0}}}\n\n',
    'event: content_block_start\n',
    'data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}\n\n',
    'event: content_block_delta\n',
    'data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}\n\n',
    'event: content_block_delta\n',
    'data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" world"}}\n\n',
    'event: content_block_stop\n',
    'data: {"type":"content_block_stop","index":0}\n\n',
    'event: message_delta\n',
    'data: {"type":"message_delta","delta":{"stop_reason":"end_turn","stop_sequence":null},"usage":{"output_tokens":2}}\n\n',
    'event: message_stop\n',
    'data: {"type":"message_stop"}\n\n',
].join("");

export const anthropicHappyPathHandler = http.post(
    "https://api.anthropic.com/v1/messages",
    () =>
        HttpResponse.text(sseBody, {
            headers: {
                "Content-Type": "text/event-stream",
            },
        }),
);