import { ReactElement } from "react";

import styles from "./styles.module.css";

type ReactChildren = {
    children: ReactElement | ReactElement[];
};

export function MdFullScreenDialog({ children }: ReactChildren) {
    return <div className={styles.full_size_dialog}>{children}</div>;
}
