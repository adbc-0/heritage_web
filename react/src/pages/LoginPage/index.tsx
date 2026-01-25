import { FormEvent, useEffect } from "react";
import { useNavigate } from "react-router";

import { http } from "@/constants/httpStatusCodes";
import { RouterPath } from "@/constants/routePaths";
import { useHeritage } from "@/features/heritageData/heritageContext";
import { useAuth } from "@/features/auth/authContext";
import { AuthErrorType, AuthErrorTypeValues, AuthStatus } from "@/features/auth/constants";
import { OutlineTextField } from "@/components/ui/OutlineTextField/OutlineTextField.tsx";
import { MdButton } from "@/components/ui/MdButton/MdButton.tsx";

import { GlobalError } from "../GlobalError/GlobalError";

import styles from "./styles.module.css";

type LoginFormInputs = {
    password: string;
};

function getLoginError(authError: AuthErrorTypeValues | null) {
    if (!authError) {
        return { ok: true, text: null };
    }
    if (authError === AuthErrorType.WRONG_PASSWORD) {
        return { ok: false, text: "Niepoprawne hasło" };
    }
    throw new Error("all error values must be handled");
}

export function LoginPage() {
    const navigate = useNavigate();

    const { fetchHeritage, heritageError } = useHeritage();
    const { authError, authInProgress, authStatus, setAuthCookieAndAuthorize } = useAuth();

    const loginNetworkError = getLoginError(authError);

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
                        <p>Dostęp do zawartości jest chroniony hasłem</p>
                    </div>
                    <div className={styles.login_actions}>
                        <OutlineTextField
                            label="Hasło"
                            className={styles.password_input}
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            error={loginNetworkError.text}
                        />
                        <MdButton type="submit" disabled={authInProgress} className={styles.login_button}>
                            Wyślij
                        </MdButton>
                    </div>
                </div>
            </form>
        </div>
    );
}

// ToDo: check out https://naszrod.pl/osoby/I87
