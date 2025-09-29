import { createContext, useContext } from "react";

import { LoadingState, LoadingStateValues } from "@/constants/heritage";

import type { HeritageRaw } from "@/types/heritage.types.ts";

export type HeritageContextType = {
    heritage: HeritageRaw | null;
    heritageStatus: LoadingStateValues;
    heritageError: boolean;
    fetchHeritage: () => Promise<Response>;
};

export const HeritageContext = createContext<HeritageContextType>({
    heritage: null,
    heritageError: false,
    heritageStatus: LoadingState.IDLE,
    fetchHeritage: () => {
        throw new Error("context used outside provider");
    },
});

export function useHeritage() {
    return useContext(HeritageContext);
}
