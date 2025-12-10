import { useHeritage } from "@/features/heritageData/heritageContext.ts";
import { useState } from "react";
import { FullPerson } from "@/types/heritage.types.ts";

export function useGlobalSearch() {
    const { heritage } = useHeritage();

    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<FullPerson[]>([]);

    const search = (newQuery: string) => {
        setQuery(newQuery);

        if (!heritage) {
            throw new Error("No data to search through");
        }

        if (newQuery === "") {
            setSearchResults([]);
            return;
        }

        const queriedPeople = heritage.people
            .filter((person) => person.type === "PERSON_NODE")
            .filter((person) => person.firstName.length !== 0 && person.lastName.length !== 0)
            .filter((person) => person.firstName.includes(newQuery));

        setSearchResults(queriedPeople);
    };

    return { searchResults, query, search };
}
