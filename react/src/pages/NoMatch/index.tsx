import styles from "./styles.module.css";

export function NoMatch() {
    return (
        <div className={styles.page}>
            <h1 className={styles.error_code}>404</h1>
            <h1 className={styles.description}>Strona nie istnieje</h1>
        </div>
    );
}
