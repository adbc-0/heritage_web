import { ReactElement, useMemo, useState } from "react";

import { hasTouchSupport } from "@/lib/utils";
import { DeviceTypeContext } from "@/contexts/deviceMode";
import { DeviceType } from "@/constants/deviceType";

type ReactChildren = {
    children: ReactElement | ReactElement[];
};

export function DeviceModeProvider({ children }: ReactChildren) {
    const [deviceType] = useState(hasTouchSupport() ? DeviceType.MOBILE : DeviceType.DESKTOP);
    const deviceTypeContextValue = useMemo(() => ({ deviceType }), [deviceType]);
    return <DeviceTypeContext value={deviceTypeContextValue}>{children}</DeviceTypeContext>;
}
