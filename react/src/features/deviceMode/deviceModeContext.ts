import { createContext, useContext } from "react";

import type { DeviceTypeValues } from "@/features/deviceMode/constants";
import { initialDeviceType } from "@/features/deviceMode/utils";

export type DeviceTypeContextType = {
    deviceType: DeviceTypeValues;
};

export const DeviceTypeContext = createContext<DeviceTypeContextType>({
    deviceType: initialDeviceType
});

export function useDeviceDetect() {
    return useContext(DeviceTypeContext);
}
