import { ReactElement, useEffect, useState } from "react";

import { ENV } from "@/constants/env";
import { http } from "@/constants/httpStatusCodes";
import { LoadingState, LoadingStateValues } from "@/features/heritageData/constants";
import { HeritageContext, HeritageContextType } from "@/features/heritageData/heritageContext";
import { useAuth } from "@/features/auth/authContext";
import { LoadingPage } from "@/pages/LoadingPage";
import { GlobalError } from "@/pages/GlobalError/GlobalError";

import type { HeritageRaw } from "@/types/heritage.types.ts";

type ReactChildren = {
    children: ReactElement | ReactElement[];
};

const API_HERITAGE = `${ENV.API_URL}/heritage`;

export function HeritageProvider({ children }: ReactChildren) {
    const { authorize, unauthorize } = useAuth();
    const [heritage, setHeritage] = useState<HeritageRaw | null>(null);
    const [heritageError, setHeritageError] = useState(false);
    const [heritageStatus, setHeritageStatus] = useState<LoadingStateValues>(LoadingState.IDLE);

    // react compiler make sure reference is stable
    const fetchHeritage = async () => {
        setHeritageStatus(LoadingState.LOADING);
        const networkResponse = await fetch(API_HERITAGE, {
            credentials: "include",
        });
        if (networkResponse.status === http.OK_STATUS_CODE) {
            const rawHeritageJson = (await networkResponse.json()) as HeritageRaw;
            setHeritage(rawHeritageJson);
            setHeritageStatus(LoadingState.DONE);
            return networkResponse;
        }
        if (networkResponse.status === http.FORBIDDEN_STATUS_CODE) {
            setHeritageStatus(LoadingState.DONE);
            return networkResponse;
        }
        setHeritageStatus(LoadingState.DONE);
        setHeritageError(true);
        return networkResponse;
    };

    useEffect(() => {
        async function initHeritage() {
            const networkResponse = await fetchHeritage();
            if (networkResponse.status === http.OK_STATUS_CODE) {
                authorize();
            }
            if (networkResponse.status === http.FORBIDDEN_STATUS_CODE) {
                unauthorize();
            }
        }
        void initHeritage();
    }, [authorize, fetchHeritage, unauthorize]);

    const heritageContextValue: HeritageContextType = {
        heritage,
        heritageError,
        heritageStatus,
        fetchHeritage,
    };

    if (heritageError) {
        // ToDo: Error boundary
        return <GlobalError />;
    }
    if (heritageStatus === LoadingState.IDLE) {
        return <LoadingPage />;
    }
    if (heritageStatus === LoadingState.LOADING) {
        return <LoadingPage />;
    }

    return <HeritageContext value={heritageContextValue}>{children}</HeritageContext>;
}
