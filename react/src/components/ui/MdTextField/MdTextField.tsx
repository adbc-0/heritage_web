import * as React from "react";
import { useId } from "react";
import { clsx } from "clsx";

import styles from "./styles.module.css";

interface MdLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    className?: string;
    errorMessage?: string;
}

export function MdTextField({ label, className = "", errorMessage, disabled, ...inputProps }: MdLabelInputProps) {
    const inputId = useId();
    const ariaInputErrorMessage = errorMessage ? `${inputId}-error` : undefined;

    return (
        <div className={styles.container}>
            <label htmlFor={inputId} className={clsx(styles.label)}>
                {label}
            </label>
            <input
                id={inputId}
                className={clsx(styles.input, className)}
                placeholder={" "}
                disabled={disabled}
                aria-invalid={!!errorMessage}
                aria-errormessage={ariaInputErrorMessage}
                {...inputProps}
            />
            {errorMessage && <p className="">{errorMessage}</p>}
        </div>
    );
}
