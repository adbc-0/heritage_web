import { createContext, useContext } from "react";

import { AuthErrorTypeValues, AuthStatus, AuthStatusValues } from "@/constants/auth";

export type AuthContextType = {
    authInProgress: boolean;
    authError: AuthErrorTypeValues | null;
    authStatus: AuthStatusValues;
    authorize: () => void;
    setAuthCookieAndAuthorize: (basicAuthString: string) => Promise<Response>;
    unauthorize: () => void;
};

export const AuthContext = createContext<AuthContextType>({
    authStatus: AuthStatus.UNKNOWN,
    authInProgress: false,
    authError: null,
    setAuthCookieAndAuthorize: () => {
        throw new Error("context used outside provider");
    },
    authorize: () => {
        throw new Error("context used outside provider");
    },
    unauthorize: () => {
        throw new Error("context used outside provider");
    },
});

export function useAuth() {
    return useContext(AuthContext);
}
