import { ReactElement } from "react";

import { hasTouchSupport } from "@/lib/utils";
import { DeviceTypeContext } from "@/contexts/deviceMode";
import { DeviceType } from "@/constants/deviceType";

type ReactChildren = {
    children: ReactElement | ReactElement[];
};

const deviceType = hasTouchSupport() ? DeviceType.MOBILE : DeviceType.DESKTOP;

export function DeviceModeProvider({ children }: ReactChildren) {
    const deviceTypeContextValue = { deviceType };
    return <DeviceTypeContext value={deviceTypeContextValue}>{children}</DeviceTypeContext>;
}
