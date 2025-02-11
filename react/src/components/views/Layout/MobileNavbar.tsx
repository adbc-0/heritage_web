import { NavLink } from "react-router";
import { BookHeart, HandCoins, House, Mail, Menu, Network, ScrollText, User } from "lucide-react";

import { RouterPath } from "@/constants/routePaths";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNavbar() {
    return (
        <nav className="fixed bottom-0 flex justify-around bg-background w-full p-2 pt-3 border-t border-border h-[4.25rem]">
            <NavLink to={RouterPath.ROOT}>
                <House className="m-auto" />
                <span>Główna</span>
            </NavLink>
            <NavLink to={RouterPath.OSOBY}>
                <User className="m-auto" />
                <span>Osoby</span>
            </NavLink>
            <NavLink to={RouterPath.GAŁĘZIE}>
                <Network className="m-auto" />
                <span>Gałęzie</span>
            </NavLink>
            <Sheet>
                <SheetTrigger>
                    <Menu className="m-auto" />
                    <span>Menu</span>
                </SheetTrigger>
                <SheetContent className="flex flex-col justify-center">
                    <SheetHeader>
                        <SheetTitle>Nasz Ród</SheetTitle>
                        <SheetDescription />
                    </SheetHeader>
                    <SheetClose asChild>
                        <NavLink to={RouterPath.ROOT} className="flex gap-2 p-2">
                            <House />
                            <span>Strona główna</span>
                        </NavLink>
                    </SheetClose>
                    <SheetClose asChild>
                        <NavLink to={RouterPath.OSOBY} className="flex gap-2 p-2">
                            <User />
                            <span>Osoby</span>
                        </NavLink>
                    </SheetClose>
                    <SheetClose asChild>
                        <NavLink to={RouterPath.GAŁĘZIE} className="flex gap-2 p-2">
                            <Network />
                            <span>Gałęzie</span>
                        </NavLink>
                    </SheetClose>
                    <SheetHeader>
                        <SheetTitle>O stronie</SheetTitle>
                        <SheetDescription />
                    </SheetHeader>
                    <SheetClose asChild>
                        <NavLink to={RouterPath.O_MNIE} className="flex gap-2 p-2">
                            <BookHeart />
                            <span>O mnie</span>
                        </NavLink>
                    </SheetClose>
                    <SheetClose asChild>
                        <NavLink to={RouterPath.RODO} className="flex gap-2 p-2">
                            <ScrollText />
                            <span>Rodo</span>
                        </NavLink>
                    </SheetClose>
                    <SheetClose asChild>
                        <NavLink to={RouterPath.KONTAKT} className="flex gap-2 p-2">
                            <Mail />
                            <span>Kontakt</span>
                        </NavLink>
                    </SheetClose>
                    <SheetClose asChild>
                        <NavLink to={RouterPath.WSPARCIE} className="flex gap-2 p-2">
                            <HandCoins />
                            <span>Wsparcie</span>
                        </NavLink>
                    </SheetClose>
                </SheetContent>
            </Sheet>
        </nav>
    );
}
