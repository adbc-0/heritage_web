import { Outlet } from "react-router";

import { useDeviceDetect } from "@/features/deviceMode/deviceModeContext";
import { DeviceType } from "@/features/deviceMode/constants";

import { DesktopTopbar } from "./DesktopTopbar";
import { MobileTopbar } from "./MobileTopbar";

import styles from "./styles.module.css";

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
            <div className={styles.main_desktop}>
                <DesktopTopbar />
                <main className={styles.desktop_content}>
                    <Outlet />
                </main>
            </div>
        );
    }
    if (deviceType === DeviceType.MOBILE) {
        return (
            <div className={styles.main}>
                <MobileTopbar />
                <main>
                    <Outlet />
                </main>
            </div>
        );
    }
    throw new Error("unhandled device type");
}
