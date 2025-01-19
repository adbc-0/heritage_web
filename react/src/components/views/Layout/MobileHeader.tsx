import { preload } from "react-dom";

import LOGO from "@/assets/logo.svg";

export function MobileHeader() {
    preload(LOGO, { as: "image", type: "image/svg+xml" });
    return (
        <nav className="bg-background px-8 py-3 items-center border-b border-border gap-2">
            <img src={LOGO} width={170} height={32} className="m-auto" alt="logo" />
        </nav>
    );
}
