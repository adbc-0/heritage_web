import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import clsx from "clsx";

import { useDeviceDetect } from "@/features/deviceMode/deviceModeContext";
import { DeviceType } from "@/features/deviceMode/constants";
import { RouterPath } from "@/constants/routePaths";
import { MdIconButton } from "@/components/ui/MdIconButton/MdIconButton";
import { isPersonInvisible, searchFamily, searchPerson } from "@/features/heritageGraph/utils";
import { useHeritage } from "@/features/heritageData/heritageContext";

import type { FullPerson, HeritageRaw } from "@/types/heritage.types.ts";

import styles from "./styles.module.css";

type Person = FullPerson & {
    dad: string | null;
    mom: string | null;
};

interface PersonListProps {
    searchQuery: string;
}

export function PeopleList({ searchQuery }: PersonListProps) {
    const { deviceType } = useDeviceDetect();
    if (deviceType === DeviceType.MOBILE) {
        return <MobilePeopleList searchQuery={searchQuery} />;
    }
    if (deviceType === DeviceType.DESKTOP) {
        return <DesktopPeopleList searchQuery={searchQuery} />;
    }
    throw new Error("Unsupported device type");
}

function getPersonName(person: FullPerson) {
    let name = person.firstName;
    if (person.nickName) {
        name += ` "${person.nickName}"`;
    }
    name += ` ${person.lastName}`;
    return name;
}

function getPersonDates(person: FullPerson): string {
    if (person.birth == null && person.death == null) {
        return "";
    }
    return `${person.birth?.date.year.toString() ?? ""} - ${person.death?.date.year.toString() ?? ""}`;
}

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
    const queryRegex = new RegExp(searchQuery.toLowerCase());
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
    BIRTH: "BIRTH",
    DEATH: "DEATH",
} as const;
const SortByNameLabel = {
    FIRST_NAME: "imieniu",
    NICK_NAME: "przezwisku",
    LAST_NAME: "nazwisku",
    BIRTH: "roku urodzenia",
    DEATH: "roku śmierci",
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
        ASC: <span className={clsx("material-symbols-outlined", styles.sorting_icon)}>arrow_upward</span>,
        DESC: <span className={clsx("material-symbols-outlined", styles.sorting_icon)}>arrow_downward</span>,
    },
    [SortBy.NICK_NAME]: {
        ASC: <span className={clsx("material-symbols-outlined", styles.sorting_icon)}>arrow_upward</span>,
        DESC: <span className={clsx("material-symbols-outlined", styles.sorting_icon)}>arrow_downward</span>,
    },
    [SortBy.LAST_NAME]: {
        ASC: <span className={clsx("material-symbols-outlined", styles.sorting_icon)}>arrow_upward</span>,
        DESC: <span className={clsx("material-symbols-outlined", styles.sorting_icon)}>arrow_downward</span>,
    },
    [SortBy.BIRTH]: {
        ASC: <span className={clsx("material-symbols-outlined", styles.sorting_icon)}>arrow_upward</span>,
        DESC: <span className={clsx("material-symbols-outlined", styles.sorting_icon)}>arrow_downward</span>,
    },
    [SortBy.DEATH]: {
        ASC: <span className={clsx("material-symbols-outlined", styles.sorting_icon)}>arrow_upward</span>,
        DESC: <span className={clsx("material-symbols-outlined", styles.sorting_icon)}>arrow_downward</span>,
    },
} as const;

function MobilePeopleList({ searchQuery }: PersonListProps) {
    const navigate = useNavigate();
    const { heritage } = useHeritage();

    const sortingModalRef = useRef<HTMLDialogElement>(null);

    const [sortByCriterion, setSortByCriterion] = useState<SortByType>(SortBy.FIRST_NAME);
    const [sortDirection, setSortDirection] = useState<DirectionType>(Direction.ASC);

    const people = filterOutPeople(basicPeopleTransformations(heritage), searchQuery).toSorted(
        sortBy(sortByCriterion, sortDirection),
    );

    if (people.length === 0) {
        return (
            <div>
                <p className={styles.empty_result}>Brak wyników</p>
            </div>
        );
    }

    function changeSortingCriterion(criterion: SortByType) {
        if (criterion === sortByCriterion) {
            setSortDirection((current) => (current === Direction.ASC ? Direction.DESC : Direction.ASC));
            return;
        }
        setSortByCriterion(criterion);
        setSortDirection(Direction.ASC);

        if (sortingModalRef.current) {
            sortingModalRef.current.close();
        }
    }

    return (
        <>
            <div className={styles.list_actions}>
                <p>Ilość osób: {people.length}</p>
                <MdIconButton
                    iconName="sort"
                    className={styles.sort_mobile_button}
                    onClick={() => {
                        if (!sortingModalRef.current) {
                            throw new Error("missing element reference: sorting_modal");
                        }
                        sortingModalRef.current.showModal();
                    }}
                />
            </div>
            <div className={styles.flex_list}>
                {people.map((person) => (
                    <button
                        key={person.id}
                        type="button"
                        className={styles.flex_item}
                        onClick={() => {
                            void navigate(`${RouterPath.OSOBY}/${person.id}`);
                        }}
                    >
                        <div className={styles.item_name}>{getPersonName(person)}</div>
                        <div className={styles.item_dates}>{getPersonDates(person)}</div>
                    </button>
                ))}
            </div>
            <dialog ref={sortingModalRef} id="sorting_modal" closedby="any" className={styles.sorting_dialog}>
                <div>
                    <p className={styles.sorting_by_label}>Sortuj po</p>
                    <ul className={styles.sorting_buttons_list}>
                        <li>
                            <button
                                className={styles.sorting_button}
                                type="button"
                                role="switch"
                                aria-checked={sortByCriterion === SortBy.FIRST_NAME}
                                onClick={() => {
                                    changeSortingCriterion(SortBy.FIRST_NAME);
                                }}
                            >
                                {sortByCriterion === SortBy.FIRST_NAME && (
                                    <span className={clsx("material-symbols-outlined")}>check</span>
                                )}
                                <span className={styles.sorting_button_label}>Imieniu</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={styles.sorting_button}
                                type="button"
                                role="switch"
                                aria-checked={sortByCriterion === SortBy.LAST_NAME}
                                onClick={() => {
                                    changeSortingCriterion(SortBy.LAST_NAME);
                                }}
                            >
                                {sortByCriterion === SortBy.LAST_NAME && (
                                    <span className={clsx("material-symbols-outlined")}>check</span>
                                )}
                                <span className={styles.sorting_button_label}>Nazwisku</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={styles.sorting_button}
                                type="button"
                                role="switch"
                                aria-checked={sortByCriterion === SortBy.BIRTH}
                                onClick={() => {
                                    changeSortingCriterion(SortBy.BIRTH);
                                }}
                            >
                                {sortByCriterion === SortBy.BIRTH && (
                                    <span className={clsx("material-symbols-outlined")}>check</span>
                                )}
                                <span className={styles.sorting_button_label}>Roku urodzenia</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={styles.sorting_button}
                                type="button"
                                role="switch"
                                aria-checked={sortByCriterion === SortBy.DEATH}
                                onClick={() => {
                                    changeSortingCriterion(SortBy.DEATH);
                                }}
                            >
                                {sortByCriterion === SortBy.DEATH && (
                                    <span className={clsx("material-symbols-outlined")}>check</span>
                                )}
                                <span className={styles.sorting_button_label}>Roku śmierci</span>
                            </button>
                        </li>
                    </ul>
                </div>
                <div className={styles.break_line}></div>
                <div>
                    <p className={styles.sorting_by_label}>Kolejność sortowania</p>
                    <ul className={styles.sorting_buttons_list}>
                        <li>
                            <button
                                className={styles.sorting_button}
                                type="button"
                                role="switch"
                                aria-checked={sortDirection === Direction.ASC}
                                onClick={() => {
                                    setSortDirection(Direction.ASC);
                                }}
                            >
                                {sortDirection === Direction.ASC && (
                                    <span className={clsx("material-symbols-outlined")}>check</span>
                                )}
                                <span className={styles.sorting_button_label}>Rosnąco</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={styles.sorting_button}
                                type="button"
                                role="switch"
                                aria-checked={sortDirection === Direction.DESC}
                                onClick={() => {
                                    setSortDirection(Direction.DESC);
                                }}
                            >
                                {sortDirection === Direction.DESC && (
                                    <span className={clsx("material-symbols-outlined")}>check</span>
                                )}
                                <span className={styles.sorting_button_label}>Malejąco</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </dialog>
        </>
    );
}

function renderSortingIcon(selectedCriterion: SortByType) {
    return function (criterion: SortByType, direction: DirectionType) {
        if (selectedCriterion !== criterion) {
            return null;
        }
        return sortingIconByTypeMap[criterion][direction];
    };
}

// use router element instead of navigate?
function DesktopPeopleList({ searchQuery }: PersonListProps) {
    const navigate = useNavigate();
    const { heritage } = useHeritage();

    const sortingModalRef = useRef<HTMLDialogElement>(null);

    const [sortByCriterion, setSortByCriterion] = useState<SortByType>(SortBy.FIRST_NAME);
    const [sortDirection, setSortDirection] = useState<DirectionType>(Direction.ASC);

    const people = filterOutPeople(basicPeopleTransformations(heritage), searchQuery).toSorted(
        sortBy(sortByCriterion, sortDirection),
    );

    function changeSortingCriterion(criterion: SortByType) {
        if (criterion === sortByCriterion) {
            setSortDirection((current) => (current === Direction.ASC ? Direction.DESC : Direction.ASC));
            return;
        }
        setSortByCriterion(criterion);
        setSortDirection(Direction.ASC);

        if (sortingModalRef.current) {
            sortingModalRef.current.close();
        }
    }

    if (people.length === 0) {
        return (
            <div>
                <p className={styles.empty_result}>Brak wyników</p>
            </div>
        );
    }

    return (
        <div>
            <div className={styles.list_actions}>
                <p>Ilość osób: {people.length}</p>
                <button
                    type="button"
                    className={styles.sort_desktop_button}
                    onClick={() => {
                        if (!sortingModalRef.current) {
                            throw new Error("missing element reference: sorting_modal");
                        }
                        sortingModalRef.current.showModal();
                    }}
                >
                    Sortuj po {SortByNameLabel[sortByCriterion]}
                    <span className="material-symbols-outlined">keyboard_arrow_down</span>
                </button>
            </div>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.table_head_row}>
                        <th className={styles.table_head_element}>
                            <button
                                type="button"
                                className={styles.sortable_properties}
                                onClick={() => {
                                    changeSortingCriterion(SortBy.FIRST_NAME);
                                }}
                            >
                                <span>Imię oraz nazwisko</span>
                                {renderSortingIcon(SortBy.FIRST_NAME)(sortByCriterion, sortDirection)}
                                {renderSortingIcon(SortBy.LAST_NAME)(sortByCriterion, sortDirection)}
                            </button>
                        </th>
                        <th className={styles.table_head_element}>
                            <div className={styles.sortable_properties}>
                                <span>Ojciec</span>
                            </div>
                        </th>
                        <th className={styles.table_head_element}>
                            <div className={styles.sortable_properties}>
                                <span>Matka</span>
                            </div>
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
                            <td className={styles.table_element}>{getPersonName(person)}</td>
                            <td className={styles.table_element}>{person.dad}</td>
                            <td className={styles.table_element}>{person.mom}</td>
                            <td className={styles.table_element}>{person.birth?.date.year}</td>
                            <td className={styles.table_element}>{person.death?.date.year}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <dialog ref={sortingModalRef} id="sorting_modal" closedby="any" className={styles.sorting_dialog}>
                <div>
                    <p className={styles.sorting_by_label}>Sortuj po</p>
                    <ul className={styles.sorting_buttons_list}>
                        <li>
                            <button
                                className={styles.sorting_button}
                                type="button"
                                role="switch"
                                aria-checked={sortByCriterion === SortBy.FIRST_NAME}
                                onClick={() => {
                                    changeSortingCriterion(SortBy.FIRST_NAME);
                                }}
                            >
                                {sortByCriterion === SortBy.FIRST_NAME && (
                                    <span className={clsx("material-symbols-outlined")}>check</span>
                                )}
                                <span className={styles.sorting_button_label}>Imieniu</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={styles.sorting_button}
                                type="button"
                                role="switch"
                                aria-checked={sortByCriterion === SortBy.LAST_NAME}
                                onClick={() => {
                                    changeSortingCriterion(SortBy.LAST_NAME);
                                }}
                            >
                                {sortByCriterion === SortBy.LAST_NAME && (
                                    <span className={clsx("material-symbols-outlined")}>check</span>
                                )}
                                <span className={styles.sorting_button_label}>Nazwisku</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={styles.sorting_button}
                                type="button"
                                role="switch"
                                aria-checked={sortByCriterion === SortBy.BIRTH}
                                onClick={() => {
                                    changeSortingCriterion(SortBy.BIRTH);
                                }}
                            >
                                {sortByCriterion === SortBy.BIRTH && (
                                    <span className={clsx("material-symbols-outlined")}>check</span>
                                )}
                                <span className={styles.sorting_button_label}>Roku urodzenia</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={styles.sorting_button}
                                type="button"
                                role="switch"
                                aria-checked={sortByCriterion === SortBy.DEATH}
                                onClick={() => {
                                    changeSortingCriterion(SortBy.DEATH);
                                }}
                            >
                                {sortByCriterion === SortBy.DEATH && (
                                    <span className={clsx("material-symbols-outlined")}>check</span>
                                )}
                                <span className={styles.sorting_button_label}>Roku śmierci</span>
                            </button>
                        </li>
                    </ul>
                </div>
                <div className={styles.break_line}></div>
                <div>
                    <p className={styles.sorting_by_label}>Kolejność sortowania</p>
                    <ul className={styles.sorting_buttons_list}>
                        <li>
                            <button
                                className={styles.sorting_button}
                                type="button"
                                role="switch"
                                aria-checked={sortDirection === Direction.ASC}
                                onClick={() => {
                                    setSortDirection(Direction.ASC);
                                }}
                            >
                                {sortDirection === Direction.ASC && (
                                    <span className={clsx("material-symbols-outlined")}>check</span>
                                )}
                                <span className={styles.sorting_button_label}>Rosnąco</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={styles.sorting_button}
                                type="button"
                                role="switch"
                                aria-checked={sortDirection === Direction.DESC}
                                onClick={() => {
                                    setSortDirection(Direction.DESC);
                                }}
                            >
                                {sortDirection === Direction.DESC && (
                                    <span className={clsx("material-symbols-outlined")}>check</span>
                                )}
                                <span className={styles.sorting_button_label}>Malejąco</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </dialog>
        </div>
    );
}
