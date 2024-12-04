import { createContext, useContext } from "react";

import { AuthStatus, AuthStatusValues } from "@/constants/AuthStatus";

type AuthContextT = {
    authStatus: AuthStatusValues;
    authorize: () => void;
    unauthorize: () => void;
};

export const AuthContext = createContext<AuthContextT>({
    authStatus: AuthStatus.UNKNOWN,
    authorize: () => {
        throw new Error("error: Context used outside provider");
    },
    unauthorize: () => {
        throw new Error("error: Context used outside provider");
    },
});

export function useAuth() {
    return useContext(AuthContext);
}
