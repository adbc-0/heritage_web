import { LockKeyhole } from "lucide-react";
import { FormEvent, useEffect, useId } from "react";
import { useNavigate } from "react-router";

import { http } from "@/constants/httpStatusCodes";
import { RouterPath } from "@/constants/routePaths";
import { useHeritage } from "@/contexts/heritageContext";
import { Button } from "@/components/ui/button";
import { AuthErrorType, AuthStatus } from "@/constants/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/authContext";
import { GlobalError } from "../GlobalError/GlobalError";

type LoginFormInputs = {
    password: string;
};

export function LoginPage() {
    const navigate = useNavigate();
    const passwordId = useId();

    const { fetchHeritage, heritageError } = useHeritage();
    const { authError, authInProgress, authStatus, setAuthCookieAndAuthorize } = useAuth();

    useEffect(() => {
        if (authStatus !== AuthStatus.AUTHORIZED) {
            return;
        }
        void navigate(RouterPath.ROOT);
    }, [authStatus, navigate]);

    async function login(e: FormEvent) {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries()) as LoginFormInputs;
        const basicAuthString = btoa(`user:${formJson.password}`);

        const authResponse = await setAuthCookieAndAuthorize(basicAuthString);
        if (authResponse.status !== http.NO_CONTENT_STATUS_CODE) {
            return;
        }

        const response = await fetchHeritage();
        if (!response.ok) {
            // ToDo: set heritage error?
            throw new Error("Could not get heritage data");
        }
    }

    if (authStatus === AuthStatus.AUTHORIZED) {
        return null;
    }
    if (authError === AuthErrorType.UNKNOWN) {
        return <GlobalError />;
    }
    if (heritageError) {
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
                    <Button className="w-full mt-3" type="submit" disabled={authInProgress}>
                        Wyślij
                    </Button>
                </div>
            </form>
        </div>
    );
}
