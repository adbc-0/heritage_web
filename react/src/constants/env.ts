import { isNil } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL;

function required(variable: string | undefined) {
    if (isNil(variable)) {
        throw new Error("missing required env variable");
    }
    return variable;
}

export const ENV = {
    API_URL: required(API_URL),
} as const;
