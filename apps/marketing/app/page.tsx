const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173";

export default function HomePage(): React.JSX.Element {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    DreamAI
                </h1>
                <p className="max-w-md text-neutral-400">
                    One chat. Many models. Pick the AI that answers you.
                </p>
            </div>

            <a href={appUrl} className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-medium text-white transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400">
                Start chatting
            </a>

            <p className="text-xs text-neutral-600">
                Echo mode - tracker bullet, no auth yet
            </p>
        </main>
    );
}