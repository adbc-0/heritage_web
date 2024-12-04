import { Fragment } from "react/jsx-runtime";

import { PersonTableRow } from "@/typescript/person";

type SectionProps = {
    title: string;
    rows: PersonTableRow[];
};

export function Section({ rows, title }: SectionProps) {
    if (rows.length === 0) {
        return;
    }
    return (
        <>
            <h2 className="text-center font-semibold my-3">{title}</h2>
            <div className="grid grid-cols-[1fr_1fr] max-w-fit mx-auto bg-border gap-px border border-border rounded-md [&>*]:bg-background [&>*]:px-5 [&>*]:py-2 [&>*:nth-child(even)]:text-end [&>*:nth-child(1)]:rounded-tl-md [&>*:nth-child(2)]:rounded-tr-md [&>*:nth-last-child(1)]:rounded-br-md [&>*:nth-last-child(2)]:rounded-bl-md">
                {rows.map(({ id, name, value }) => (
                    <Fragment key={`${id}-${name}-${String(value)}`}>
                        <p>{name}</p>
                        <p>{value}</p>
                    </Fragment>
                ))}
            </div>
        </>
    );
}