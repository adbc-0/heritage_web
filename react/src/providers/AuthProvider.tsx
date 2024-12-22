import { ReactElement, useCallback, useMemo, useState } from "react";

import { AuthErrorType, AuthErrorTypeValues, AuthStatus, AuthStatusValues } from "@/constants/auth";
import { AuthContext, AuthContextType } from "@/contexts/authContext";
import { ApiError } from "@/typescript/api";
import { ENV } from "@/constants/env";

type ReactChildren = {
    children: ReactElement | ReactElement[];
};

const API_AUTH = `${ENV.API_URL}/auth`;
const WRONG_PASSWORD_ERROR_MESSAGE = "Incorrect password";

export function AuthProvider({ children }: ReactChildren) {
    const [authInProgress, setAuthInProgress] = useState(false);
    const [authError, setAuthError] = useState<AuthErrorTypeValues | null>(null);
    const [authStatus, setAuthStatus] = useState<AuthStatusValues>(AuthStatus.UNKNOWN);

    const authorize = useCallback(() => {
        setAuthStatus(AuthStatus.AUTHORIZED);
    }, []);

    const unauthorize = useCallback(() => {
        setAuthStatus(AuthStatus.UNAUTHORIZED);
    }, []);

    const setAuthCookieAndAuthorize = useCallback(
        async (basicAuthString: string) => {
            setAuthInProgress(true);
            const response = await fetch(API_AUTH, {
                method: "POST",
                headers: {
                    Authorization: `Basic ${basicAuthString}`,
                },
                credentials: "include",
            });
            if (response.status === 401) {
                setAuthInProgress(false);
                const error = (await response.json()) as ApiError;
                if (error.message === WRONG_PASSWORD_ERROR_MESSAGE) {
                    setAuthError(AuthErrorType.WRONG_PASSWORD);
                    return response;
                }
                setAuthError(AuthErrorType.UNKNOWN);
                unauthorize();
                return response;
            }
            if (!response.ok) {
                setAuthInProgress(false);
                setAuthError(AuthErrorType.UNKNOWN);
                unauthorize();
                return response;
            }
            setAuthInProgress(false);
            setAuthError(null);
            authorize();
            return response;
        },
        [authorize, unauthorize],
    );

    const authValue: AuthContextType = useMemo(
        () => ({
            authInProgress,
            authError,
            authStatus,
            authorize,
            setAuthCookieAndAuthorize,
            unauthorize,
        }),
        [authorize, authError, authInProgress, authStatus, setAuthCookieAndAuthorize, unauthorize],
    );

    return <AuthContext value={authValue}>{children}</AuthContext>;
}
