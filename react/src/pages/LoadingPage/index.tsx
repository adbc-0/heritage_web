import { Loader } from "lucide-react";

import styles from "./styles.module.css";

export function LoadingPage() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.overlay}>
                <div className={styles.center}>
                    <Loader size={40} className={styles.spinner} />
                </div>
            </div>
        </div>
    );
}
