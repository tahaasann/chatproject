import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const proxyTarget = process.env.VITE_PROXY_TARGET ?? "http://localhost:3001";

const apiProxy = {
    "/v1": { target: proxyTarget, changeOrigin: true },
    "/healthz": { target: proxyTarget, changeOrigin: true },
} as const;

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: true,
        port: 5173,
        proxy: apiProxy,
    },
    preview: {
        host: true,
        port: 5173,
        proxy: apiProxy,
    },
});