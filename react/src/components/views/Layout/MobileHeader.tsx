import { preload } from "react-dom";
import { useEffect } from "react";

import LOGO from "@/assets/logo.svg";

export function MobileHeader() {
    useEffect(() => {
        document.getElementById("root").dispatchEvent(new MouseEvent("click", { bubbles: true }));
        setTimeout(() => {
            document
                .getElementById("root")
                .dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }, 1000);
    }, []);
    preload(LOGO, { as: "image", type: "image/svg+xml" });
    return (
        <header className="bg-background px-8 py-3 items-center border-b border-border gap-2">
            <img src={LOGO} width={170} height={32} className="m-auto" alt="logo" />
        </header>
    );
}
