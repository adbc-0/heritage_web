import clsx from "clsx";

import styles from "./styles.module.css";

export function LoadingPage() {
    return (
        <div className={styles.page}>
            <span className={clsx("material-symbols-outlined", styles.spinner)} style={{ fontSize: 40 }}>
                autorenew
            </span>
        </div>
    );
}
