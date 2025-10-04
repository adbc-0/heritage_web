import { Link } from "react-router";
import { SquareArrowOutUpRight } from "lucide-react";

import { RouterPath } from "@/constants/routePaths";

import type { FullPerson } from "@/types/heritage.types";

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
            <h2 className="text-center font-semibold my-3">{title}</h2>
            <div className="max-w-fit mx-auto">
                <div className="mx-1 flex flex-col rounded-md">
                    {people.map((person) => (
                        <Link
                            className="flex gap-2 bg-background border-t border-x last:border-b first:rounded-t-md last:rounded-b-md border-border px-5 py-2 hover:bg-background-darker"
                            key={person.id}
                            to={`${RouterPath.OSOBY}/${person.id}`}
                        >
                            {person.firstName} {person.lastName}
                            <SquareArrowOutUpRight />
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}
