import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isNil(value: unknown): value is null | undefined {
    return typeof value === "undefined" || value === null;
}
