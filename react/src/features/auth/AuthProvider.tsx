import { ReactElement, useState } from "react";

import { ENV } from "@/constants/env";
import { AuthErrorType, AuthErrorTypeValues, AuthStatus, AuthStatusValues } from "@/features/auth/constants";
import { AuthContext, AuthContextType } from "@/features/auth/authContext";

import type { ApiError } from "@/types/api.types.ts";

type ReactChildren = {
    children: ReactElement | ReactElement[];
};

const API_AUTH = `${ENV.API_URL}/auth`;
const WRONG_PASSWORD_ERROR_MESSAGE = "Incorrect password";

export function AuthProvider({ children }: ReactChildren) {
    const [authInProgress, setAuthInProgress] = useState(false);
    const [authError, setAuthError] = useState<AuthErrorTypeValues | null>(null);
    const [authStatus, setAuthStatus] = useState<AuthStatusValues>(AuthStatus.UNKNOWN);

    const authorize = () => {
        setAuthStatus(AuthStatus.AUTHORIZED);
    };

    const unauthorize = () => {
        setAuthStatus(AuthStatus.UNAUTHORIZED);
    };

    const setAuthCookieAndAuthorize = async (basicAuthString: string) => {
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
    };

    const authValue: AuthContextType = {
        authInProgress,
        authError,
        authStatus,
        authorize,
        setAuthCookieAndAuthorize,
        unauthorize,
    };

    return <AuthContext value={authValue}>{children}</AuthContext>;
}
