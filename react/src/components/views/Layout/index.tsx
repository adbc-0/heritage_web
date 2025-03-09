import { Outlet } from "react-router";

import { useDeviceDetect } from "@/contexts/deviceMode";
import { DeviceType } from "@/constants/deviceType";
import { DesktopNavbar } from "./DesktopNavbar";
import { DesktopFooter } from "./DesktopFooter";
import { MobileHeader } from "./MobileHeader";

// Next version:
// Remove bottom nav bar from mobile

// Centering vertically elements on mobile chrome (and possibly safari) properly is not possible.
// When entering website using url initial innerHeight is calculated with added virtual keyboard (for example 900px instead of 600px).
// It also makes bottom navbar
// Related stack overflow thread:
//  - https://stackoverflow.com/questions/76026292/why-is-window-innerheight-incorrect-until-i-tap-chrome-android

export function Layout() {
    const { deviceType } = useDeviceDetect();
    if (deviceType === DeviceType.DESKTOP) {
        return (
            <div className="min-h-full grid grid-rows-[min-content_auto_min-content] grid-cols-1 bg-background-darker">
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
            <div className="min-h-full grid grid-rows-[min-content_auto_min-content] grid-cols-1 bg-background-darker">
                <MobileHeader />
                <main>
                    <Outlet />
                </main>
            </div>
        );
    }
    throw new Error("unhandled device type");
}
