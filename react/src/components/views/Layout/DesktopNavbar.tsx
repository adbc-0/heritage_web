import { preload } from "react-dom";
import { NavLink, NavLinkRenderProps } from "react-router";

import LOGO from "@/assets/logo.svg";

import { RouterPath } from "@/constants/routePaths";

const navlinkStyle = ({ isActive }: NavLinkRenderProps) =>
    isActive
        ? "text-highlight bg-highlight-background border border-highlight-background rounded-3xl py-2 px-3"
        : "text-foreground bg-background border border-background rounded-3xl py-2 px-3 hover:bg-accent";

export function DesktopNavbar() {
    preload(LOGO, { as: "image", type: "image/svg+xml" });
    return (
        <nav className="bg-background grid grid-cols-[auto_1fr] px-8 py-3 items-center border-b border-border gap-2">
            <NavLink to={RouterPath.ROOT} className="flex items-center gap-2 text-xl font-semibold">
                <img src={LOGO} width={170} height={32} className="cursor-pointer" alt="logo" />
            </NavLink>
            <div className="justify-self-end flex gap-1 text-sm font-medium">
                <NavLink to={RouterPath.OSOBY} className={navlinkStyle}>
                    Osoby
                </NavLink>
            </div>
        </nav>
    );
}
