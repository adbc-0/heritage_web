import { LockKeyhole } from "lucide-react";
import { FormEvent, useId, useState } from "react";

import { ENV } from "@/constants/Env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/typescript/api";
import { GlobalError } from "../GlobalError/GlobalError";

type LoginFormInputs = {
    password: string;
};

type LoginFormProps = {
    authorize: () => void;
};

const AuthorizationRoute = `${ENV.API_URL}/auth`;

const AuthErrorType = {
    WRONG_PASSWORD: "WRONG_PASSWORD",
    UNKNOWN: "UNKNOWN",
} as const;
type AuthErrorTypeValues = (typeof AuthErrorType)[keyof typeof AuthErrorType];

const incorrectPasswordErrorMessage = "Incorrect password";

export function LoginForm({ authorize }: LoginFormProps) {
    const passwordId = useId();
    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const [authError, setAuthError] = useState<AuthErrorTypeValues | null>(null);

    async function login(e: FormEvent) {
        e.preventDefault();

        setIsAuthorizing(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries()) as LoginFormInputs;
        const basicAuthString = btoa(`user:${formJson.password}`);
        const response = await fetch(AuthorizationRoute, {
            method: "POST",
            headers: {
                Authorization: `Basic ${basicAuthString}`,
            },
            credentials: "include",
        });
        if (response.status === 401) {
            setIsAuthorizing(false);
            const error = (await response.json()) as ApiError;
            if (error.message === incorrectPasswordErrorMessage) {
                setAuthError(AuthErrorType.WRONG_PASSWORD);
                return;
            }
            setAuthError(AuthErrorType.UNKNOWN);
            return;
        }
        if (!response.ok) {
            setIsAuthorizing(false);
            setAuthError(AuthErrorType.UNKNOWN);
            return;
        }
        setIsAuthorizing(false);
        setAuthError(null);
        authorize();
    }

    if (authError === AuthErrorType.UNKNOWN) {
        return <GlobalError />;
    }

    return (
        <div className="h-[100dvh] flex items-center justify-center border border-border">
            <form onSubmit={(e) => void login(e)}>
                <div className="flex flex-col gap-2 items-center p-5 border border-border rounded-t-md">
                    <LockKeyhole size={60} />
                    <h1 className="text-xl font-bold tracking-tight mt-2">Wymagane hasło</h1>
                    <p className="text-sm text-muted-foreground">
                        Dostęp do zasobów jest chroniony hasłem
                    </p>
                </div>
                <div className="bg-background-darker p-5 border border-border rounded-b-md border-t-0">
                    {authError === AuthErrorType.WRONG_PASSWORD && (
                        <div className="bg-red-50 border border-red-800 p-2 rounded-md mb-3">
                            <p className="text-red-800 text-center text-sm">Niepoprawne hasło</p>
                        </div>
                    )}
                    <Label className="text-xs text-muted-foreground" htmlFor={passwordId}>
                        HASŁO
                    </Label>
                    <Input
                        required
                        id={passwordId}
                        className="bg-white"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                    />
                    <Button className="w-full mt-3" type="submit" disabled={isAuthorizing}>
                        Wyślij
                    </Button>
                </div>
            </form>
        </div>
    );
}
