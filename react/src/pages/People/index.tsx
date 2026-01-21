import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowDown01, ArrowDown10, ArrowDownAZ, ArrowDownZa } from "lucide-react";

import { isPersonInvisible, searchFamily, searchPerson } from "@/features/heritageGraph/utils";
import { RouterPath } from "@/constants/routePaths";
import { useHeritage } from "@/features/heritageData/heritageContext";

import styles from "./styles.module.css";

import type { FullPerson, HeritageRaw } from "@/types/heritage.types.ts";
import clsx from "clsx";

type Person = FullPerson & {
    dad: string | null;
    mom: string | null;
};

function searchParent(heritage: HeritageRaw, personId: string) {
    const parent = searchPerson(heritage, personId);
    if (!parent) {
        throw new Error("parent not found");
    }
    return parent;
}

function getPersonFullName(person: FullPerson) {
    return [person.firstName, person.lastName].join(" ");
}

function getParentName(heritage: HeritageRaw, personId: string | null) {
    if (!personId) {
        return null;
    }
    const parent = searchParent(heritage, personId);
    if (isPersonInvisible(parent)) {
        return null;
    }
    return getPersonFullName(parent);
}

function mapParents(heritage: HeritageRaw) {
    return function (person: FullPerson) {
        if (!person.famc) {
            return { ...person, dad: null, mom: null };
        }
        const parentsFamily = searchFamily(heritage, person.famc);
        if (!parentsFamily) {
            return { ...person, dad: null, mom: null };
        }
        return {
            ...person,
            dad: getParentName(heritage, parentsFamily.husb),
            mom: getParentName(heritage, parentsFamily.wife),
        };
    };
}

function basicPeopleTransformations(heritage: HeritageRaw | null): Person[] {
    if (!heritage) {
        return [];
    }
    return heritage.people.filter((person) => !isPersonInvisible(person)).map(mapParents(heritage));
}

function filterOutPeople(people: Person[], searchQuery: string): Person[] {
    if (!searchQuery) {
        return people;
    }
    const queryRegex = new RegExp(searchQuery);
    return people.filter((person) => {
        const fullName = [person.firstName, person.nickName, person.lastName].filter(Boolean).join(" ").toLowerCase();
        const searchResult = fullName.match(queryRegex);
        return Boolean(searchResult);
    });
}

const SortBy = {
    FIRST_NAME: "FIRST_NAME",
    NICK_NAME: "NICK_NAME",
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
    return typeof v === "undefined" || v === null;
}

function sortByTextAsc(accessor: "firstName" | "lastName" | "dad" | "mom" | "nickName") {
    return function (a: Person, b: Person) {
        const aValue = a[accessor];
        const bValue = b[accessor];
        if (isNil(aValue)) {
            return 1;
        }
        if (isNil(bValue)) {
            return -1;
        }
        if (aValue === "") {
            return 1;
        }
        if (bValue === "") {
            return -1;
        }
        return aValue.localeCompare(bValue);
    };
}
function sortByTextDesc(accessor: "firstName" | "lastName" | "dad" | "mom" | "nickName") {
    return function (a: Person, b: Person) {
        const aValue = a[accessor];
        const bValue = b[accessor];
        if (isNil(aValue)) {
            return 1;
        }
        if (isNil(bValue)) {
            return -1;
        }
        if (aValue === "") {
            return 1;
        }
        if (bValue === "") {
            return -1;
        }
        return bValue.localeCompare(aValue);
    };
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
    };
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
    };
}

const sortingAlgorithmByType = {
    [SortBy.FIRST_NAME]: {
        ASC: sortByTextAsc("firstName"),
        DESC: sortByTextDesc("firstName"),
    },
    [SortBy.NICK_NAME]: {
        ASC: sortByTextAsc("nickName"),
        DESC: sortByTextDesc("nickName"),
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
    [SortBy.FIRST_NAME]: {
        ASC: <ArrowDownAZ />,
        DESC: <ArrowDownZa />,
    },
    [SortBy.NICK_NAME]: {
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

// ToDo: Add pagination
export default function People() {
    const navigate = useNavigate();
    const { heritage } = useHeritage();
    const [searchParams] = useSearchParams();

    const [filterPeopleQuery, setFilterPeopleQuery] = useState(searchParams.get("search") ?? "");
    const [sortByCriterion, setSortByCriterion] = useState<SortByType>(SortBy.FIRST_NAME);
    const [sortDirection, setSortDirection] = useState<DirectionType>(Direction.ASC);

    const people = filterOutPeople(basicPeopleTransformations(heritage), filterPeopleQuery).toSorted(
        sortBy(sortByCriterion, sortDirection),
    );

    function changeSortingCriterion(criterion: SortByType) {
        if (criterion === sortByCriterion) {
            setSortDirection((current) => (current === Direction.ASC ? Direction.DESC : Direction.ASC));
            return;
        }
        setSortByCriterion(criterion);
        setSortDirection(Direction.ASC);
    }

    return (
        <div className={styles.view}>
            <div className={styles.input_wrapper}>
                <div className={styles.input}>
                    <input
                        className={styles.search}
                        placeholder="Wyszukaj osobę..."
                        value={filterPeopleQuery}
                        onChange={(event) => {
                            setFilterPeopleQuery(event.target.value.toLowerCase());
                        }}
                    />
                    <div className={styles.leading_icon}>
                        <span className={clsx("material-symbols-outlined", styles.leading_icon_style)}>search</span>
                    </div>
                </div>
            </div>
            {people.length > 0 ? (
                <div className={styles.table_wrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr className={styles.table_row}>
                                <th className={styles.table_head_element}>
                                    <button
                                        type="button"
                                        className={styles.sortable_properties}
                                        onClick={() => {
                                            changeSortingCriterion(SortBy.FIRST_NAME);
                                        }}
                                    >
                                        <span>Imię</span>
                                        {renderSortingIcon(SortBy.FIRST_NAME)(sortByCriterion, sortDirection)}
                                    </button>
                                </th>
                                <th className={styles.table_head_element}>
                                    <button
                                        type="button"
                                        className={styles.sortable_properties}
                                        onClick={() => {
                                            changeSortingCriterion(SortBy.NICK_NAME);
                                        }}
                                    >
                                        <span>Przydomek</span>
                                        {renderSortingIcon(SortBy.NICK_NAME)(sortByCriterion, sortDirection)}
                                    </button>
                                </th>
                                <th className={styles.table_head_element}>
                                    <button
                                        type="button"
                                        className={styles.sortable_properties}
                                        onClick={() => {
                                            changeSortingCriterion(SortBy.LAST_NAME);
                                        }}
                                    >
                                        <span>Nazwisko</span>
                                        {renderSortingIcon(SortBy.LAST_NAME)(sortByCriterion, sortDirection)}
                                    </button>
                                </th>
                                <th className={styles.table_head_element}>
                                    <button
                                        type="button"
                                        className={styles.sortable_properties}
                                        onClick={() => {
                                            changeSortingCriterion(SortBy.FATHER);
                                        }}
                                    >
                                        <span>Ojciec</span>
                                        {renderSortingIcon(SortBy.FATHER)(sortByCriterion, sortDirection)}
                                    </button>
                                </th>
                                <th className={styles.table_head_element}>
                                    <button
                                        type="button"
                                        className={styles.sortable_properties}
                                        onClick={() => {
                                            changeSortingCriterion(SortBy.MOTHER);
                                        }}
                                    >
                                        <span>Matka</span>
                                        {renderSortingIcon(SortBy.MOTHER)(sortByCriterion, sortDirection)}
                                    </button>
                                </th>
                                <th className={styles.table_head_element}>
                                    <button
                                        type="button"
                                        className={styles.sortable_properties}
                                        onClick={() => {
                                            changeSortingCriterion(SortBy.BIRTH);
                                        }}
                                    >
                                        <span>Rok urodzenia</span>
                                        {renderSortingIcon(SortBy.BIRTH)(sortByCriterion, sortDirection)}
                                    </button>
                                </th>
                                <th className={styles.table_head_element}>
                                    <button
                                        type="button"
                                        className={styles.sortable_properties}
                                        onClick={() => {
                                            changeSortingCriterion(SortBy.DEATH);
                                        }}
                                    >
                                        <span>Rok śmierci</span>
                                        {renderSortingIcon(SortBy.DEATH)(sortByCriterion, sortDirection)}
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {people.map((person) => (
                                <tr
                                    key={person.id}
                                    className={styles.table_row}
                                    onClick={() => {
                                        void navigate(`${RouterPath.OSOBY}/${person.id}`);
                                    }}
                                >
                                    <td className={styles.table_element}>{person.firstName}</td>
                                    <td className={styles.table_element}>{person.nickName}</td>
                                    <td className={styles.table_element}>{person.lastName}</td>
                                    <td className={styles.table_element}>{person.dad}</td>
                                    <td className={styles.table_element}>{person.mom}</td>
                                    <td className={styles.table_element}>{person.birth?.date.year}</td>
                                    <td className={styles.table_element}>{person.death?.date.year}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div>
                    <p className={styles.empty_result}>Brak wyników</p>
                </div>
            )}
        </div>
    );
}
