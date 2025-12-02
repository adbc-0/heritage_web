import * as React from "react";

import styles from "./styles.module.css";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function MdInput({ placeholder, ...props }: InputProps) {
    return (
        <div className={styles.inputWrapper}>
            <input {...props} className={styles.input} placeholder={placeholder} />
            <span className={styles.label}>{placeholder}</span>
        </div>
    );
}
