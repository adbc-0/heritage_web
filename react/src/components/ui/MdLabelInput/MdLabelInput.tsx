import * as React from "react";
import { useId } from "react";
import { clsx } from "clsx";

import styles from "./styles.module.css";

interface MdLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    className?: string;
    errorMessage?: string;
}

export function MdLabelInput({ label, className = "", errorMessage, disabled, ...inputProps }: MdLabelInputProps) {
    const inputId = useId();
    const ariaInputErrorMessage = errorMessage ? `${inputId}-error` : undefined;

    return (
        <div className={styles.container}>
            <input
                id={inputId}
                className={clsx(styles.input, className, {
                    "cursor-not-allowed": disabled,
                    "border-2 border-darkerRed": disabled,
                })}
                placeholder={" "}
                disabled={disabled}
                aria-invalid={!!errorMessage}
                aria-errormessage={ariaInputErrorMessage}
                {...inputProps}
            />
            <label
                htmlFor={inputId}
                className={clsx(styles.label, {
                    "text-darkerRed": Boolean(errorMessage),
                    "text-darkGray": !errorMessage,
                })}
            >
                {label}
            </label>
            {errorMessage ? (
                <p className="ml-4 mt-1 text-darkerRed text-sm font-bold" id={`${inputId}-error`}>
                    {errorMessage}
                </p>
            ) : null}
        </div>
    );
}
