import { useState } from "react";
import { NavLink, NavLinkRenderProps } from "react-router";
import { BookHeart, HandCoins, House, Mail, Menu, Network, ScrollText, User } from "lucide-react";

import { RouterPath } from "@/constants/routePaths";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const navlinkStyle = ({ isActive }: NavLinkRenderProps) =>
    isActive
        ? "min-w-[4rem] py-0.5 text-highlight bg-highlight-background border border-highlight-background rounded-3xl"
        : "min-w-[4rem] py-0.5 text-foreground bg-background border border-background rounded-3xl hover:bg-accent";

const sidebarNavlinkStyle = ({ isActive }: NavLinkRenderProps) =>
    isActive
        ? "flex gap-2 p-2 bg-highlight-background text-highlight rounded-md"
        : "flex gap-2 p-2 bg-background text-foreground rounded-md";

// ToDo: Every time user opens sidebar it rerenders page content many times. Fix rerender issue.
export function MobileNavbar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <nav className="sticky bottom-0 flex justify-around items-center bg-background w-full p-2 pt-3 border-t border-border">
            <NavLink to={RouterPath.ROOT} className={navlinkStyle}>
                <House size={22} className="m-auto" />
                <span className="text-xs font-medium block text-center">Główna</span>
            </NavLink>
            <NavLink to={RouterPath.OSOBY} className={navlinkStyle}>
                <User size={22} className="m-auto" />
                <span className="text-xs font-medium block text-center">Osoby</span>
            </NavLink>
            <NavLink to={RouterPath.GAŁĘZIE} className={navlinkStyle}>
                <Network size={22} className="m-auto" />
                <span className="text-xs font-medium block text-center">Gałęzie</span>
            </NavLink>
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger className="py-0.5 min-w-[4rem]">
                    <Menu size={22} className="m-auto" />
                    <span className="text-xs font-medium block text-center">Menu</span>
                </SheetTrigger>
                <SheetContent className="flex flex-col justify-center">
                    <SheetHeader>
                        <SheetTitle>Nasz Ród</SheetTitle>
                        <SheetDescription />
                    </SheetHeader>
                    <NavLink
                        to={RouterPath.ROOT}
                        className={sidebarNavlinkStyle}
                        onClick={() => {
                            setSidebarOpen(false);
                        }}
                    >
                        <House />
                        <span>Strona główna</span>
                    </NavLink>
                    <NavLink
                        to={RouterPath.OSOBY}
                        className={sidebarNavlinkStyle}
                        onClick={() => {
                            setSidebarOpen(false);
                        }}
                    >
                        <User />
                        <span>Osoby</span>
                    </NavLink>
                    <NavLink
                        to={RouterPath.GAŁĘZIE}
                        className={sidebarNavlinkStyle}
                        onClick={() => {
                            setSidebarOpen(false);
                        }}
                    >
                        <Network />
                        <span>Gałęzie</span>
                    </NavLink>
                    <SheetHeader>
                        <SheetTitle>O stronie</SheetTitle>
                        <SheetDescription />
                    </SheetHeader>
                    <NavLink
                        to={RouterPath.O_MNIE}
                        className={sidebarNavlinkStyle}
                        onClick={() => {
                            setSidebarOpen(false);
                        }}
                    >
                        <BookHeart />
                        <span>O mnie</span>
                    </NavLink>
                    <NavLink
                        to={RouterPath.RODO}
                        className={sidebarNavlinkStyle}
                        onClick={() => {
                            setSidebarOpen(false);
                        }}
                    >
                        <ScrollText />
                        <span>Rodo</span>
                    </NavLink>
                    <NavLink
                        to={RouterPath.KONTAKT}
                        className={sidebarNavlinkStyle}
                        onClick={() => {
                            setSidebarOpen(false);
                        }}
                    >
                        <Mail />
                        <span>Kontakt</span>
                    </NavLink>
                    <NavLink
                        to={RouterPath.WSPARCIE}
                        className={sidebarNavlinkStyle}
                        onClick={() => {
                            setSidebarOpen(false);
                        }}
                    >
                        <HandCoins />
                        <span>Wsparcie</span>
                    </NavLink>
                </SheetContent>
            </Sheet>
        </nav>
    );
}
