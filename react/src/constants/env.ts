const API_URL = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && !API_URL) {
    throw new Error("missing env variables");
}

export const ENV = {
    API_URL: API_URL ?? "https://localhost/api",
};
