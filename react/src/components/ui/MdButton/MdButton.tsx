import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./styles.module.css";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function MdButton({ className, ...props }: ButtonProps) {
    return <button {...props} className={cn(styles.button, className)}></button>;
}
