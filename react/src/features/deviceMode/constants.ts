export const MOBILE_DEVICE_QUERY = "(width <= 640px)";

export const DeviceType = {
    MOBILE: "MOBILE",
    DESKTOP: "DESKTOP",
} as const;
export type DeviceTypeValues = (typeof DeviceType)[keyof typeof DeviceType];
