import { type SubmitEvent, useState } from "react";
import { useChatStream } from "./useChatStream";

export function ChatPage(): React.JSX.Element {
    const { messages, isStreaming, error, send } = useChatStream();
    const [input, setInput] = useState("");

    async function onSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const text = input;
        setInput("");
        await send(text);
    }

    return (
        <div className="flex h-screen flex-col bg-neutral-950 text-neutral-100">
            <header className="border-b border-neutral-800 px-6 py-4">
                <h1 className="text-lg font-semibold">DreamAI - Chat</h1>
                <p className="text-xs text-neutral-500">
                    Echo mode (no real model connected yet)
                </p>
            </header>

            <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
                {messages.length === 0 ? (
                    <p className="m-auto text-sm text-neutral-600">
                        Send a message to get started.
                    </p>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className={
                            message.role === "user" ? "self-end rounded-2xl bg-blue-600 px-4 py-2 text-sm" : "self-start rounded-2xl bg-neutral-800 px-4 py-2 text-sm"
                        }
                        >
                            {message.content || (isStreaming ? "..." : "")}
                        </div>
                    ))
                )}
            </main>

            {error ? (
                <p className="px-4 pb-2 text-center text-xs text-red-400">{error}</p>
            ) : null}

            <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-3xl gap-2 px-4 pb-6">
                <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type a message..."
                    disabled={isStreaming}
                    className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isStreaming || input.trim().length === 0}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium disabled:opacity-40"
                >
                    {isStreaming ? "..." : "Send"}
                </button>
            </form>
        </div>
    );
}