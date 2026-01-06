import clsx from "clsx";
import { Link } from "react-router";

import { RouterPath } from "@/constants/routePaths";

import type { FullPerson } from "@/types/heritage.types";

import styles from "./styles.module.css";

type SectionProps = {
    title: string;
    people: FullPerson[];
};

export function SectionWithLinks({ people, title }: SectionProps) {
    if (people.length === 0) {
        return;
    }

    return (
        <>
            <h2 className={styles.title}>{title}</h2>
            <ul className={styles.list}>
                {people.map((person) => (
                    <li key={person.id} className={styles.list_element}>
                        <p className={styles.family_name}>
                            {person.firstName} {person.lastName}
                        </p>
                        <Link className={styles.family} key={person.id} to={`${RouterPath.OSOBY}/${person.id}`}>
                            <span className={clsx("material-symbols-outlined", styles.open_new_icon)}>open_in_new</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
}
