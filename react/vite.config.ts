import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

console.log(process.env);
console.log("VITE_ENV", process.env.VITE_API_URL, process.env.VITE_API_URL?.length);

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
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
