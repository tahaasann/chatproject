import { AuthProvider, useAuth } from "./features/auth/AuthProvider";
import { AuthPage } from "./features/auth/AuthPage";
import { ChatPage } from "./features/chat/ChatPage";

function AppGate(): React.JSX.Element {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
                Loading...
            </div>
        );
    }

    if (!session) {
        return <AuthPage />;
    }

    return <ChatPage />;
}

export function App(): React.JSX.Element {
    return (
        <AuthProvider>
            <AppGate />
        </AuthProvider>
    );
}