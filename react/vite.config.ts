import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    server: {
        allowedHosts: ["naszrod.local"],
        host: true,
        hmr: {
            clientPort: 443,
        },
    },
    build: {
        target: "esnext",
    },
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
