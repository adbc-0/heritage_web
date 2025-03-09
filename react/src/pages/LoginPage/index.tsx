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
        void navigate(RouterPath.ROOT, { replace: true });
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
        <div className="flex items-center justify-center pt-12 sm:pt-0 sm:h-full sm:bg-background-darker sm:border sm:border-border">
            <form onSubmit={(e) => void login(e)}>
                <div className="flex flex-col gap-5 items-center px-6 py-8 bg-background rounded-3xl">
                    <LockKeyhole size={60} />
                    <div className="text-center">
                        <h1 className="text-xl font-bold tracking-tight">Wymagane hasło</h1>
                        <p className="text-sm text-muted-foreground">
                            Dostęp do zawartości jest chroniony hasłem
                        </p>
                    </div>
                    {authError === AuthErrorType.WRONG_PASSWORD && (
                        <div className="w-full bg-red-50 py-2 px-4 rounded-md">
                            <p className="text-red-800 text-center">Niepoprawne hasło</p>
                        </div>
                    )}
                    <div>
                        <Label className="text-sm" htmlFor={passwordId}>
                            Hasło
                        </Label>
                        <Input
                            id={passwordId}
                            className="bg-white"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                        />
                        <Button
                            className="cursor-pointer w-full mt-3 active:scale-95 transition-transform"
                            type="submit"
                            disabled={authInProgress}
                        >
                            Wyślij
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
