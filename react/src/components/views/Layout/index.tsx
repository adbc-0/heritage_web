import { Outlet } from "react-router";
import { Footer } from "./Footer";
import { DesktopNavbar } from "./DesktopNavbar";

// for desktop view fill remaining height
export function Layout() {
    return (
        <div className="min-h-full grid grid-rows-[auto_1fr_auto] grid-cols-1 bg-background-darker">
            <DesktopNavbar />
            <Outlet />
            <Footer />
        </div>
    );
}
