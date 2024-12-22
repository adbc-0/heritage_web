export const AuthStatus = {
    UNKNOWN: "UNKNOWN",
    AUTHORIZED: "AUTHORIZED",
    UNAUTHORIZED: "UNAUTHORIZED",
};
export type AuthStatusValues = (typeof AuthStatus)[keyof typeof AuthStatus];
export const AuthErrorType = {
    WRONG_PASSWORD: "WRONG_PASSWORD",
    UNKNOWN: "UNKNOWN",
} as const;
export type AuthErrorTypeValues = (typeof AuthErrorType)[keyof typeof AuthErrorType];
