import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isNil(value: unknown): value is null | undefined {
    return typeof value === "undefined" || value === null;
}

export function stripFileExtension(filename: string) {
    return filename.split(".").at(0);
}
