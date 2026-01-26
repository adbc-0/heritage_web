import { useDeferredValue, useState } from "react";
import { useSearchParams } from "react-router";
import clsx from "clsx";

import { PeopleList } from "./PeopleList";

import styles from "./styles.module.css";

// ToDo: Add pagination
export default function People() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");
    const deferredQuery = useDeferredValue(searchQuery);

    return (
        <div className={styles.view}>
            <div className={styles.input_wrapper}>
                <div className={styles.input}>
                    <input
                        className={styles.search}
                        placeholder="Wyszukaj osobę..."
                        value={searchQuery}
                        onChange={(event) => {
                            setSearchQuery(event.target.value);
                            setSearchParams({ search: event.target.value });
                        }}
                    />
                    <div className={styles.leading_icon}>
                        <span className={clsx("material-symbols-outlined", styles.leading_icon_style)}>search</span>
                    </div>
                </div>
            </div>
            <PeopleList searchQuery={deferredQuery} />
        </div>
    );
}
