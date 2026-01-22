import clsx from "clsx";

import styles from "./styles.module.css";

export function Loader() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.overlay}>
                <div className={styles.center}>
                    <span className={clsx("material-symbols-outlined", styles.spinner)} style={{ fontSize: 40 }}>
                        autorenew
                    </span>
                </div>
            </div>
        </div>
    );
}
