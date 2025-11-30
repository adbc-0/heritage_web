import * as React from "react";

import styles from "./styles.module.css";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function MdInput({ ...props }: InputProps) {
    return (
        <input {...props} className={styles.input} />
        // <div className={styles.inputWrapper}>
        //     <input {...props} className={styles.input} />
        //     <span className={styles.label}>dwa</span>
        // </div>
    );
}
