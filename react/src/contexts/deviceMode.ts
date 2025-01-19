import { createContext, useContext } from "react";

import { hasTouchSupport } from "@/lib/utils";
import { DeviceType, DeviceTypeValues } from "@/constants/deviceType";

export type DeviceTypeContextType = {
    deviceType: DeviceTypeValues;
};

export const DeviceTypeContext = createContext<DeviceTypeContextType>({
    deviceType: hasTouchSupport() ? DeviceType.MOBILE : DeviceType.DESKTOP,
});

export function useDeviceDetect() {
    return useContext(DeviceTypeContext);
}
