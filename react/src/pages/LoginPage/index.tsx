import { FormEvent, useEffect } from "react";
import { useNavigate } from "react-router";

import { http } from "@/constants/httpStatusCodes";
import { RouterPath } from "@/constants/routePaths";
import { useHeritage } from "@/features/heritageData/heritageContext";
import { useAuth } from "@/features/auth/authContext";
import { AuthErrorType, AuthStatus } from "@/features/auth/constants";
import { GlobalError } from "../GlobalError/GlobalError";

import styles from "./styles.module.css";
import { MdButton } from "@/components/ui/MdButton/MdButton.tsx";
import { MdInput } from "@/components/ui/MdInput/MdInput.tsx";

type LoginFormInputs = {
    password: string;
};

// use material ui icons
// use css modules for styling
// create new generic components

export function LoginPage() {
    const navigate = useNavigate();

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
            // ToDo: set heritageData error?
            throw new Error("Could not get heritageData data");
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
        <div className={styles.login_page_wrapper}>
            <form onSubmit={(e) => void login(e)}>
                <div className={styles.login_form_wrapper}>
                    <div className={styles.no_access_wrapper}>
                        <img src="/icon.svg" width={50} alt="logo" className={styles.logo} />
                        <h1 className={styles.no_access_main_text}>Brak dostępu</h1>
                        <p className={styles.no_access_subtext}>Dostęp do zawartości jest chroniony hasłem</p>
                        {/*{authError === AuthErrorType.WRONG_PASSWORD && (*/}
                        {/*    <div className="w-full bg-red-50 py-2 px-4 rounded-md">*/}
                        {/*        <p className="text-red-800 text-center">Niepoprawne hasło</p>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </div>
                    <div className={styles.login_actions}>
                        {/*<Label className="text-sm" htmlFor={passwordId}>*/}
                        {/*    Hasło*/}
                        {/*</Label>*/}
                        {/*<Input*/}
                        {/*    className="bg-white h-12"*/}
                        {/*    type="password"*/}
                        {/*    name="password"*/}
                        {/*    autoComplete="current-password"*/}
                        {/*    placeholder="Hasło"*/}
                        {/*/>*/}
                        <MdInput type="password" name="password" autoComplete="current-password" placeholder="Hasło" />
                        <MdButton type="submit" disabled={authInProgress} className={styles.login_button}>
                            Wyślij
                        </MdButton>
                    </div>
                </div>
            </form>
        </div>
    );
}
