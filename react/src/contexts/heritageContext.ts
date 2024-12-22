import { createContext, useContext } from "react";

import { LoadingState, LoadingStateValues } from "@/constants/heritage";
import { Heritage } from "@/typescript/heritage";

export type HeritageContextType = {
    heritage: Heritage | null;
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
