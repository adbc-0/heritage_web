export const AuthStatus = {
    UNKNOWN: "UNKNOWN",
    AUTHORIZED: "AUTHORIZED",
    UNAUTHORIZED: "UNAUTHORIZED",
};
export type AuthStatusValues = (typeof AuthStatus)[keyof typeof AuthStatus];
