import clsx from "clsx";

import styles from "./styles.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    iconName: string;
}

export function MdIconButton({ iconName, ...buttonProps }: ButtonProps) {
    return (
        <button className={styles.button} {...buttonProps} type="button">
            <span className={clsx("material-symbols-outlined", styles.icon)}>{iconName}</span>
        </button>
    );
}
