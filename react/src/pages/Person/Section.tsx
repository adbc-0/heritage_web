import { Fragment } from "react/jsx-runtime";

import type { FullPerson } from "@/types/heritage.types";

type SectionProps = {
    person: FullPerson;
};

function SectionRow({ k, v }: { k: string; v?: string }) {
    if (!v) {
        return null;
    }
    return (
        <Fragment key={v}>
            <p>{k}</p>
            <p>{v}</p>
        </Fragment>
    );
}

export function Section({ person }: SectionProps) {
    const { firstName, lastName, nickName, birth, death } = person;
    return (
        <>
            <h2 className="text-center font-semibold my-3">Podstawowe informacje</h2>
            <div className="max-w-fit mx-auto">
                <div className="grid grid-cols-[1fr_1fr] max-w-fit mx-1 bg-border gap-px border border-border rounded-md *:bg-background *:px-5 *:py-2 [&>*:nth-child(even)]:text-end [&>*:nth-child(1)]:rounded-tl-md [&>*:nth-child(2)]:rounded-tr-md [&>*:nth-last-child(1)]:rounded-br-md [&>*:nth-last-child(2)]:rounded-bl-md">
                    <SectionRow k="Imię" v={firstName} />
                    <SectionRow k="Nazwisko" v={lastName} />
                    <SectionRow k="Przydomek/imię używane" v={nickName} />
                    <SectionRow k="Rok urodzenia" v={birth?.date.year.toString()} />
                    <SectionRow k="Rok śmierci" v={death?.date.year.toString()} />
                </div>
            </div>
        </>
    );
}
