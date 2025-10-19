import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    server: {
        allowedHosts: ["naszrod.local"],
        host: true,
    },
    build: {
        target: "esnext",
    },
    define: {
        "import.meta.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL),
    },
    plugins: [
        react({
            babel: {
                plugins: [["babel-plugin-react-compiler"]],
            },
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
