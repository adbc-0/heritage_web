export const LoadingState = {
    IDLE: "IDLE",
    DONE: "DONE",
    LOADING: "LOADING",
} as const;
export type LoadingStateValues = (typeof LoadingState)[keyof typeof LoadingState];
