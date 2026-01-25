import type { FullPerson, PersonEvent } from "@/types/heritage.types";

import styles from "./styles.module.css";

type SectionProps = {
    person: FullPerson;
};

function displayDate(event?: PersonEvent) {
    if (!event) {
        return null;
    }
    const { day, year, month } = event.date;
    if (event.date.day) {
        return `${day.toString()}.${month.toString()}.${year.toString()}`;
    }
    if (event.date.year) {
        return year.toString();
    }
    return null;
}

function displayName(person: FullPerson) {
    let name = person.firstName;
    if (person.nickName) {
        name += ` "${person.nickName}"`;
    }
    name += ` ${person.lastName}`;

    return name;
}

function displayDates(person: FullPerson) {
    const birthDate = displayDate(person.birth);
    const deathDate = displayDate(person.death);

    if (!birthDate && !deathDate) {
        return null;
    }

    return `${birthDate ?? "?"} - ${deathDate ?? "?"}`;
}

export function Section({ person }: SectionProps) {
    return (
        <section>
            <h2 className={styles.title}>Podstawowe informacje</h2>
            <div className={styles.basic_wrapper}>
                <div className={styles.content}>
                    <p className={styles.person_name}>{displayName(person)}</p>
                    <p className={styles.person_dates}>{displayDates(person)}</p>
                </div>
                {person.placeOfBirth && (
                    <div className={styles.content}>
                        <li className={styles.list_element}>Miejsce urodzenia: {person.placeOfBirth}</li>
                    </div>
                )}
                {person.placeOfDeath && (
                    <div className={styles.content}>
                        <li className={styles.list_element}>Miejsce śmierci: {person.placeOfDeath}</li>
                    </div>
                )}
            </div>
        </section>
    );
}
