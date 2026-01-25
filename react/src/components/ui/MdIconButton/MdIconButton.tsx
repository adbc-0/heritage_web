import clsx from "clsx";

import styles from "./styles.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    iconName: string;
}

export function MdIconButton({ iconName, className, ...buttonProps }: ButtonProps) {
    return (
        <button type="button" className={clsx(styles.button, className)} {...buttonProps}>
            <span className={clsx("material-symbols-outlined", styles.icon)}>{iconName}</span>
        </button>
    );
}
