import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowDown01, ArrowDown10, ArrowDownAZ, ArrowDownZa } from "lucide-react";

import { isPersonInvisible, searchPerson, serachFamily } from "@/utils/heritage";
import { RoutePaths } from "@/constants/RoutePaths";
import { useHeritage } from "@/contexts/heritageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Heritage, Indi } from "@/typescript/heritage";

type Person = Indi & {
    dad: string | null;
    mom: string | null;
};

function searchParent(heritage: Heritage, personId: string) {
    const parent = searchPerson(heritage, personId);
    if (!parent) {
        throw new Error("parent not found");
    }
    return parent;
}

function getPersonFullName(person: Indi) {
    return [person.firstName, person.lastName].join(" ");
}

function getParentName(heritage: Heritage, personId: string | undefined) {
    if (!personId) {
        return null;
    }
    const parent = searchParent(heritage, personId);
    if (isPersonInvisible(parent)) {
        return null;
    }
    return getPersonFullName(parent);
}

function mapParents(heritage: Heritage) {
    return function (person: Indi) {
        if (!person.famc) {
            return { ...person, dad: null, mom: null };
        }
        const parentsFamily = serachFamily(heritage, person.famc);
        if (!parentsFamily) {
            return { ...person, dad: null, mom: null };
        }
        return {
            ...person,
            dad: getParentName(heritage, parentsFamily.husb),
            mom: getParentName(heritage, parentsFamily.wife)
        };
    }
}

function basicPeopleTransformations(heritage: Heritage | null): Person[] {
    if (!heritage) {
        return [];
    }
    return heritage.indis.filter((person) => !isPersonInvisible(person)).map(mapParents(heritage));
}

function filterOutPeople(people: Person[], searchQuery: string): Person[] {
    if (!searchQuery) {
        return people;
    }
    const queryRegex = new RegExp(searchQuery);
    return people.filter((person) => {
        const fullName = [person.firstName, person.lastName].join(" ").toLowerCase();
        const searchResult = fullName.match(queryRegex);
        return Boolean(searchResult);
    });
}

const SortBy = {
    NAME: "NAME",
    LAST_NAME: "LAST_NAME",
    FATHER: "FATHER",
    MOTHER: "MOTHER",
    BIRTH: "BIRTH",
    DEATH: "DEATH",
} as const;
const Direction = {
    ASC: "ASC",
    DESC: "DESC",
} as const;

type SortByType = (typeof SortBy)[keyof typeof SortBy];
type DirectionType = (typeof Direction)[keyof typeof Direction];

function isNil(v: unknown): v is null | undefined {
    return typeof v === 'undefined' || v === null;
}

function sortByTextAsc(accessor: "firstName" | "lastName" | "dad" | "mom") {
    return function (a: Person, b: Person) {
        const aValue = a[accessor];
        const bValue = b[accessor];
        if (isNil(aValue)) {
            return 1;
        }
        if (isNil(bValue)) {
            return -1;
        }
        return aValue.localeCompare(bValue);
    }
}
function sortByTextDesc(accessor: "firstName" | "lastName" | "dad" | "mom") {
    return function (a: Person, b: Person) {
        const aValue = a[accessor];
        const bValue = b[accessor];
        if (isNil(aValue)) {
            return 1;
        }
        if (isNil(bValue)) {
            return -1;
        }
        return bValue.localeCompare(aValue);
    }
}
function sortByNumberAsc(accessor: "birth" | "death") {
    return function (a: Person, b: Person) {
        const aValue = a[accessor]?.date.year;
        const bValue = b[accessor]?.date.year;
        if (isNil(aValue)) {
            return 1;
        }
        if (isNil(bValue)) {
            return -1;
        }
        return aValue - bValue;
    }
}
function sortByNumberDesc(accessor: "birth" | "death") {
    return function (a: Person, b: Person) {
        const aValue = a[accessor]?.date.year;
        const bValue = b[accessor]?.date.year;
        if (isNil(aValue)) {
            return 1;
        }
        if (isNil(bValue)) {
            return -1;
        }
        return bValue - aValue;
    }
}

const sortingAlgorithmByType = {
    [SortBy.NAME]: {
        ASC: sortByTextAsc("firstName"),
        DESC: sortByTextDesc("firstName"),
    },
    [SortBy.LAST_NAME]: {
        ASC: sortByTextAsc("lastName"),
        DESC: sortByTextDesc("lastName"),
    },
    [SortBy.MOTHER]: {
        ASC: sortByTextAsc("mom"),
        DESC: sortByTextDesc("mom"),
    },
    [SortBy.FATHER]: {
        ASC: sortByTextAsc("dad"),
        DESC: sortByTextDesc("dad"),
    },
    [SortBy.BIRTH]: {
        ASC: sortByNumberAsc("birth"),
        DESC: sortByNumberDesc("birth"),
    },
    [SortBy.DEATH]: {
        ASC: sortByNumberAsc("death"),
        DESC: sortByNumberDesc("death"),
    },
};

function sortBy(strategy: SortByType, direction: DirectionType) {
    return sortingAlgorithmByType[strategy][direction];
}

const sortingIconByTypeMap = {
    [SortBy.NAME]: {
        ASC: <ArrowDownAZ />,
        DESC: <ArrowDownZa />,
    },
    [SortBy.LAST_NAME]: {
        ASC: <ArrowDownAZ />,
        DESC: <ArrowDownZa />,
    },
    [SortBy.MOTHER]: {
        ASC: <ArrowDownAZ />,
        DESC: <ArrowDownZa />,
    },
    [SortBy.FATHER]: {
        ASC: <ArrowDownAZ />,
        DESC: <ArrowDownZa />,
    },
    [SortBy.BIRTH]: {
        ASC: <ArrowDown01 />,
        DESC: <ArrowDown10 />,
    },
    [SortBy.DEATH]: {
        ASC: <ArrowDown01 />,
        DESC: <ArrowDown10 />,
    },
} as const;

function renderSortingIcon(selectedCriterion: SortByType) {
    return function (criterion: SortByType, direction: DirectionType) {
        if (selectedCriterion !== criterion) {
            return null;
        }
        return sortingIconByTypeMap[criterion][direction];
    };
}

export default function People() {
    const heritage = useHeritage();
    const navigate = useNavigate();

    const [filterPeopleQuery, setFilterPeopleQuery] = useState("");
    const [sortByCriterion, setSortByCriterion] = useState<SortByType>(SortBy.NAME);
    const [sortDirection, setSortDirection] = useState<DirectionType>(Direction.ASC);

    const people = useMemo(() => {
        return filterOutPeople(basicPeopleTransformations(heritage), filterPeopleQuery).toSorted(
            sortBy(sortByCriterion, sortDirection),
        );
    }, [filterPeopleQuery, heritage, sortByCriterion, sortDirection]);

    function changeSortingCriterion(criterion: SortByType) {
        if (criterion === sortByCriterion) {
            console.log(sortByCriterion, sortDirection);
            setSortDirection((current) => (current === Direction.ASC ? Direction.DESC : Direction.ASC));
            return;
        }
        setSortByCriterion(criterion);
        setSortDirection(Direction.ASC);
    }

    return (
        <div className="p-8">
            <Input
                className="max-w-sm bg-background mb-4"
                placeholder="Wyszukaj osobę..."
                value={filterPeopleQuery}
                onChange={(event) => {
                    setFilterPeopleQuery(event.target.value.toLowerCase());
                }}
            />
            <div className="max-w-[calc(100vw-4rem)] rounded-md border bg-background block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <button
                                    type="button"
                                    className="w-full flex justify-center items-center gap-1"
                                    onClick={() => {
                                        changeSortingCriterion(SortBy.NAME);
                                    }}
                                >
                                    Imię
                                    {renderSortingIcon(SortBy.NAME)(sortByCriterion, sortDirection)}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    type="button"
                                    className="w-full flex justify-center items-center gap-1"
                                    onClick={() => {
                                        changeSortingCriterion(SortBy.LAST_NAME);
                                    }}
                                >
                                    Nazwisko
                                    {renderSortingIcon(SortBy.LAST_NAME)(sortByCriterion, sortDirection)}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    type="button"
                                    className="w-full flex justify-center items-center gap-1"
                                    onClick={() => {
                                        changeSortingCriterion(SortBy.FATHER);
                                    }}
                                >
                                    Ojciec
                                    {renderSortingIcon(SortBy.FATHER)(sortByCriterion, sortDirection)}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    type="button"
                                    className="w-full flex justify-center items-center gap-1"
                                    onClick={() => {
                                        changeSortingCriterion(SortBy.MOTHER);
                                    }}
                                >
                                    Matka
                                    {renderSortingIcon(SortBy.MOTHER)(sortByCriterion, sortDirection)}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    type="button"
                                    className="w-full flex justify-center items-center gap-1"
                                    onClick={() => {
                                        changeSortingCriterion(SortBy.BIRTH);
                                    }}
                                >
                                    Rok urodzenia
                                    {renderSortingIcon(SortBy.BIRTH)(sortByCriterion, sortDirection)}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    type="button"
                                    className="w-full flex justify-center items-center gap-1"
                                    onClick={() => {
                                        changeSortingCriterion(SortBy.DEATH);
                                    }}
                                >
                                    Rok śmierci
                                    {renderSortingIcon(SortBy.DEATH)(sortByCriterion, sortDirection)}
                                </button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {people.map((person) => (
                            <TableRow
                                className="cursor-pointer"
                                key={person.id}
                                onClick={() => {
                                    void navigate(`${RoutePaths.OSOBY}/${person.id}`);
                                }}
                            >
                                <TableCell className="text-center">{person.firstName}</TableCell>
                                <TableCell className="text-center">{person.lastName}</TableCell>
                                <TableCell className="text-center">{person.dad}</TableCell>
                                <TableCell className="text-center">{person.mom}</TableCell>
                                <TableCell className="text-center">{person.birth?.date.year}</TableCell>
                                <TableCell className="text-center">{person.death?.date.year}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
