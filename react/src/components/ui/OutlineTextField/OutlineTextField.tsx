import { InputHTMLAttributes, useId } from "react";

import styles from "./styles.module.css";
import { clsx } from "clsx";

interface OutlineTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    className?: string;
    error?: string | null;
}

export function OutlineTextField({
    error = null,
    type = "text",
    className,
    label,
    placeholder,
    ...props
}: OutlineTextFieldProps) {
    if (placeholder) {
        throw new Error("placeholder not supported on outline inputs");
    }

    const inputId = useId();
    const ariaInputErrorMessage = error ? `${inputId}-error` : undefined;

    return (
        <div>
            <div className={clsx(styles.outlined_input, className)}>
                <input
                    id={inputId}
                    type={type}
                    className={clsx(styles.input)}
                    placeholder=" "
                    aria-invalid={!!error}
                    aria-errormessage={ariaInputErrorMessage}
                    {...props}
                />
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
            </div>
            {error && <p className={styles.error_message}>{error}</p>}
        </div>
    );
}
