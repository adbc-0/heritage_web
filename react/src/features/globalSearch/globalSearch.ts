import { useState } from "react";

import { useHeritage } from "@/features/heritageData/heritageContext.ts";

import { FullPerson } from "@/types/heritage.types.ts";

function composeFullName(person: FullPerson) {
    return [person.firstName, person.nickName, person.lastName]
        .filter((name) => name !== "")
        .map((name) => name.toLowerCase())
        .join(" ");
}

export function useGlobalSearch() {
    const { heritage } = useHeritage();

    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<FullPerson[]>([]);

    const search = (newQuery: string) => {
        setQuery(newQuery);

        if (!heritage) {
            throw new Error("No data to search through");
        }

        const emptySearchQuery = newQuery.trim() === "";
        if (emptySearchQuery) {
            setSearchResults([]);
            return;
        }

        const queriedPeople = heritage.people
            .filter((person) => person.type === "PERSON_NODE")
            .filter((person) => person.firstName.length !== 0 && person.lastName.length !== 0)
            .map((person) => ({ ...person, fullName: composeFullName(person) }))
            .filter((person) => person.fullName.includes(newQuery.toLowerCase()));

        setSearchResults(queriedPeople);
    };

    const clear = () => {
        setQuery("");
        setSearchResults([]);
    };

    return { searchResults, query, search, clear };
}
