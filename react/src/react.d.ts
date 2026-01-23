import "react";

declare module "react" {
    interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
        commandfor?: string;
        command?: string;
    }
}

// declare global {
//   interface HTMLButtonElement {
//     commandFor: string; // Note: DOM property is camelCase
//     command: string;
//   }
// }
