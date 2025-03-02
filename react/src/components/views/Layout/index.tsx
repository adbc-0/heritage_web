import { Outlet } from "react-router";

import { useDeviceDetect } from "@/contexts/deviceMode";
import { DeviceType } from "@/constants/deviceType";
import { DesktopNavbar } from "./DesktopNavbar";
import { MobileNavbar } from "./MobileNavbar";
import { DesktopFooter } from "./DesktopFooter";
import { MobileHeader } from "./MobileHeader";

export function Layout() {
    const { deviceType } = useDeviceDetect();
    if (deviceType === DeviceType.DESKTOP) {
        return (
            <div className="min-h-full grid grid-rows-[auto_1fr_auto] grid-cols-1 bg-background-darker">
                <DesktopNavbar />
                <main>
                    <Outlet />
                </main>
                <DesktopFooter />
            </div>
        );
    }
    if (deviceType === DeviceType.MOBILE) {
        return (
            <div className="min-h-full grid grid-rows-[auto_1fr_auto] grid-cols-1 bg-background-darker">
                <MobileHeader />
                <main>
                    <Outlet />
                </main>
                <MobileNavbar />
            </div>
        );
    }
    throw new Error("unhandled device type");
}

////////////// DESKTOP
// STATIC NAVBAR -> 4rem
// MARGIN TOP    -> 1rem
// BASE          -> (100% - 2rem - 4rem - 3rem)
// MARGIN BOTTOM -> 1rem
// STATIC FOOTER -> 3rem

////////////// MOBILE
// STATIC NAVBAR -> 3.5rem
// MARGIN TOP    -> 1rem
// BASE          -> (100% - 2rem - 3rem - 3rem)
// MARGIN BOTTOM -> 1rem
// STATIC FOOTER -> 4.25rem
