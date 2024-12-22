import { NavLink, NavLinkRenderProps } from "react-router";

import { RouterPath } from "@/constants/routePaths";

const navlinkStyle = ({ isActive }: NavLinkRenderProps) =>
    isActive
        ? "text-highlight bg-highlight-background border border-highlight-background rounded-3xl py-2 px-3"
        : "text-foreground bg-background border border-background rounded-3xl py-2 px-3 hover:bg-accent";

export function Footer() {
    return (
        <div className="bg-background border-t border-border flex justify-center gap-3 py-2 text-sm">
            <NavLink to={RouterPath.KONTAKT} className={navlinkStyle}>
                Kontakt
            </NavLink>
            <NavLink to={RouterPath.RODO} className={navlinkStyle}>
                Rodo
            </NavLink>
            <NavLink to={RouterPath.WSPARCIE} className={navlinkStyle}>
                Wsparcie
            </NavLink>
            <NavLink to={RouterPath.O_MNIE} className={navlinkStyle}>
                O mnie
            </NavLink>
        </div>
    );
}
