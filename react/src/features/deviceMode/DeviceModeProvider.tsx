import { ReactElement } from "react";

import { initialDeviceType } from "@/features/deviceMode/utils";
import { DeviceTypeContext } from "@/features/deviceMode/deviceModeContext";

type ReactChildren = {
    children: ReactElement | ReactElement[];
};

export function DeviceModeProvider({ children }: ReactChildren) {
    const deviceTypeContextValue = { deviceType: initialDeviceType };
    return <DeviceTypeContext value={deviceTypeContextValue}>{children}</DeviceTypeContext>;
}
