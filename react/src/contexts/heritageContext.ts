import { createContext, useContext } from "react";

import { Heritage } from "@/typescript/heritage";

export const HeritageContext = createContext<Heritage | null>(null);

export function useHeritage() {
    return useContext(HeritageContext);
}
