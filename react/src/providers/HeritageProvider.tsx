import { ReactElement, useEffect, useState } from "react";

import { useAuth } from "@/contexts/authContext";
import { HeritageContext } from "@/contexts/heritageContext";
import { GlobalError } from "@/pages/GlobalError/GlobalError";
import { Heritage } from "@/typescript/heritage";
import { LoadingPage } from "@/pages/LoadingPage";

type ReactChildren = {
    children: ReactElement | ReactElement[];
};

const LoadingState = {
    IDLE: "IDLE",
    DONE: "DONE",
    LOADING: "LOADING",
} as const;
type LoadingStateValues = (typeof LoadingState)[keyof typeof LoadingState];

const HeritageDataRoute = `${import.meta.env.VITE_API_URL}/heritage`;
const ForbiddenStatusCode = 401;

export function HeritageProvider({ children }: ReactChildren) {
    const { authorize, unauthorize } = useAuth();
    const [heritage, setHeritage] = useState<Heritage | null>(null);
    const [unexpectedFetchingError, setUnexpectedFetchingError] = useState(false);
    const [loadingState, setLoadingState] = useState<LoadingStateValues>(LoadingState.IDLE);
    useEffect(() => {
        async function getHeritageInfo() {
            setLoadingState(LoadingState.LOADING);
            const networkResponse = await fetch(HeritageDataRoute, {
                credentials: "include",
            });
            if (networkResponse.ok) {
                const rawHeritageJson = (await networkResponse.json()) as Heritage;
                setHeritage(rawHeritageJson);
                setLoadingState(LoadingState.DONE);
                authorize();
                return;
            }
            if (networkResponse.status === ForbiddenStatusCode) {
                setLoadingState(LoadingState.DONE);
                unauthorize();
                return;
            }
            setLoadingState(LoadingState.DONE);
            setUnexpectedFetchingError(true);
        }
        void getHeritageInfo();
    }, [authorize, unauthorize]);
    if (unexpectedFetchingError) {
        return <GlobalError />
    }
    if (loadingState === LoadingState.IDLE) {
        return <LoadingPage />;
    }
    if (loadingState === LoadingState.LOADING) {
        return <LoadingPage />;
    }
    return <HeritageContext.Provider value={heritage}>{children}</HeritageContext.Provider>;
}
