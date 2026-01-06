import styles from "./styles.module.css";
import { clsx } from "clsx";

type Branch = {
    active: boolean;
    name: string;
    rootIndiId: string[];
};

type SVGSettingsProps = {
    branches: Branch[];
    toggleBranch: (branchName: string) => void;
};

export function SVGSettings({ branches, toggleBranch }: SVGSettingsProps) {
    return (
        <>
            <div className={styles.dialog_header}>
                <button
                    className={clsx("material-symbols-outlined", styles.dialog_close)}
                    command="close"
                    commandfor="graph_settings"
                >
                    close
                </button>
                <p className={styles.dialog_title}>Ustawienia wyświetlania</p>
            </div>
            <div className={styles.dialog_content}>
                <p>Wyświetlane gałęzie</p>
                <div className={styles.branches_group}>
                    {branches.map(({ name: branchName, active }) => (
                        <div key={branchName} className={styles.branch}>
                            <input
                                id={`option_${branchName}`}
                                type="checkbox"
                                className={styles.checkbox}
                                checked={active}
                                onChange={() => {
                                    toggleBranch(branchName);
                                }}
                            />
                            <label htmlFor={`option_${branchName}`}>{branchName}</label>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
