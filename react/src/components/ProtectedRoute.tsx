import { ReactElement, useEffect } from "react";
import { useNavigate } from "react-router";

import { AuthStatus } from "@/constants/auth";
import { RouterPath } from "@/constants/routePaths";
import { useAuth } from "@/contexts/authContext";
import { LoadingPage } from "@/pages/LoadingPage";

type ReactChildren = {
    children: ReactElement | ReactElement[];
};

export function ProtectedRoute({ children }: ReactChildren) {
    const navigate = useNavigate();
    const { authStatus } = useAuth();

    useEffect(() => {
        if (authStatus === AuthStatus.UNAUTHORIZED) {
            void navigate(RouterPath.LOGOWANIE, { replace: true });
        }
    }, [authStatus, navigate]);

    if (authStatus === AuthStatus.AUTHORIZED) {
        return children;
    }
    return <LoadingPage />;
}
