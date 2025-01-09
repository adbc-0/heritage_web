import { Link } from "react-router";

import { PersonTableRow } from "@/typescript/person";
import { RouterPath } from "@/constants/routePaths";
import { SquareArrowOutUpRight } from "lucide-react";

type SectionProps = {
    title: string;
    rows: PersonTableRow[];
};

export function SectionWithLinks({ rows, title }: SectionProps) {
    if (rows.length === 0) {
        return;
    }
    return (
        <>
            <h2 className="text-center font-semibold my-3">{title}</h2>
            <div className="max-w-fit mx-auto">
                <div className="mx-1 flex flex-col rounded-md">
                    {rows.map(({ id, name, value }) => (
                        <Link
                            className="flex gap-2 bg-background border-t border-x last:border-b first:rounded-t-md last:rounded-b-md border-border px-5 py-2 hover:bg-background-darker"
                            key={`${id}-${name}-${String(value)}`}
                            to={`${RouterPath.OSOBY}/${id}`}
                        >
                            {value}
                            <SquareArrowOutUpRight />
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}
