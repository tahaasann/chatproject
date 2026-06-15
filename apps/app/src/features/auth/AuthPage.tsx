import { type SubmitEvent, useState } from "react";
import { useAuth } from "./AuthProvider";

type AuthMode = "signin" | "signup";

export function AuthPage(): React.JSX.Element {
    const { signIn, signUp } = useAuth();
    const [mode, setMode] = useState<AuthMode>("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function onSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        setError(null);
        setBusy(true);

        try {
            if (mode === "signin") {
                await signIn(email.trim(), password);
            } else {
                await signUp(email.trim(), password);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Authentication failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-neutral-100">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
            >
                <h1 className="text-lg font-semibold">DreamAI</h1>
                <p className="text-xs text-neutral-500">
                    {mode === "signin" ? "Sign in to your account" : "Create an account"}
                </p>

                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    required
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                {error ? <p className="text-xs text-red-400">{error}</p> : null}

                <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium disabled:opacity-40"
                >
                    {busy ? "..." : mode === "signin" ? "Sign in" : "Sign up"}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setMode(mode === "signin" ? "signup" : "signin");
                        setError(null);
                    }}
                    className="w-full text-xs text-neutral-400 hover:text-neutral-200"
                >
                    {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
                </button>
            </form>
        </div>
    );
}