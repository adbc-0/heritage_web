import { useState } from "react";
import { preload } from "react-dom";
import { NavLink, NavLinkRenderProps } from "react-router";
import { BookHeart, HandCoins, House, Mail, Menu, ScrollText, User } from "lucide-react";

import { RouterPath } from "@/constants/routePaths";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import LOGO from "@/assets/logo.svg";

const sidebarNavlinkStyle = ({ isActive }: NavLinkRenderProps) =>
    isActive
        ? "flex gap-2 p-2 bg-highlight-background text-highlight rounded-md"
        : "flex gap-2 p-2 bg-background text-foreground rounded-md";

export function MobileTopbar() {
    preload(LOGO, { as: "image", type: "image/svg+xml" });

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <nav className="flex items-center justify-between bg-background px-8 py-3 border-b border-border ">
            <NavLink to={RouterPath.ROOT}>
                <img src={LOGO} width={170} alt="logo" />
            </NavLink>
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger>
                    <Menu size={26} className="m-auto" />
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
                        <span>Drzewo</span>
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
