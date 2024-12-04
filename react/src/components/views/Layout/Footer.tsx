import { NavLink, NavLinkRenderProps } from "react-router";

import { RoutePaths } from "@/constants/RoutePaths";

const navlinkStyle = ({ isActive }: NavLinkRenderProps) =>
    isActive
        ? "text-highlight bg-highlight-background border border-highlight-background rounded-3xl py-1 px-2"
        : "text-foreground bg-background border border-background rounded-3xl py-1 px-2 hover:bg-accent";

export function Footer() {
    return (
        <div className="bg-background border-t border-border flex justify-center gap-3 py-2 text-xs">
            <NavLink to={RoutePaths.KONTAKT} className={navlinkStyle}>
                Kontakt
            </NavLink>
            <NavLink to={RoutePaths.RODO} className={navlinkStyle}>
                Rodo
            </NavLink>
            <NavLink to={RoutePaths.WSPARCIE} className={navlinkStyle}>
                Wsparcie
            </NavLink>
            <NavLink to={RoutePaths.O_MNIE} className={navlinkStyle}>
                O mnie
            </NavLink>
        </div>
    );
}
