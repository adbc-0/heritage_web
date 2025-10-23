import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App.tsx";
import "./index.css";

if (import.meta.env.DEV) {
    console.warn("app running in dev mode");
}

const rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error("no root element");
}

createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
