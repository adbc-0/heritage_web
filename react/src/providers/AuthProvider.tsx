import { ReactElement, useCallback, useMemo, useState } from "react";

import { AuthStatus, AuthStatusValues } from "@/constants/AuthStatus";
import { AuthContext } from "@/contexts/authContext";
import { LoginForm } from "@/pages/LoginForm";

type ReactChildren = {
    children: ReactElement | ReactElement[];
};

export function AuthProvider({ children }: ReactChildren) {
    const [authStatus, setAuthStatus] = useState<AuthStatusValues>(AuthStatus.UNKNOWN);
    const authorize = useCallback(() => {
        setAuthStatus(AuthStatus.AUTHORIZED);
    }, []);
    const unauthorize = useCallback(() => {
        setAuthStatus(AuthStatus.UNAUTHORIZED);
    }, []);
    const authValue = useMemo(
        () => ({
            authStatus,
            authorize,
            unauthorize,
        }),
        [authorize, authStatus, unauthorize],
    );
    if (authStatus === AuthStatus.UNAUTHORIZED) {
        return <LoginForm authorize={authorize} />;
    }
    return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}
