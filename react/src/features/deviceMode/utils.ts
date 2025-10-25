import { MOBILE_DEVICE_QUERY, DeviceType } from "@/features/deviceMode/constants";

export function getDeviceType() {
    return window.matchMedia(MOBILE_DEVICE_QUERY).matches ? DeviceType.MOBILE : DeviceType.DESKTOP;
}

export const initialDeviceType = getDeviceType();
