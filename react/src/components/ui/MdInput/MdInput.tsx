import * as React from "react";

import { cn } from "@/lib/utils.ts";

import styles from "./styles.module.css";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function MdInput({ className, placeholder, ...inputProps }: InputProps) {
    return <input {...inputProps} className={cn(styles.input, className)} placeholder={placeholder} />;
}
