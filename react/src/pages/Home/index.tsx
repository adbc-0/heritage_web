import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router";
import { ErrorBoundary } from "react-error-boundary";
import { clsx } from "clsx";

import { ErrorFallback, HeritageGraph } from "@/features/heritageGraph/HeritageGraph";

import { SVGSettings } from "./SVGSettings";

import { useDeviceDetect } from "@/features/deviceMode/deviceModeContext";
import { DeviceType } from "@/features/deviceMode/constants";
import { useGlobalSearch } from "@/features/globalSearch/globalSearch";

import styles from "./styles.module.css";
import { MdIconButton } from "@/components/ui/MdIconButton/MdIconButton";
import { RouterPath } from "@/constants/routePaths";

// ToDo: Remove hardcoded values? Define branches roots in config?
const defaultBranches = [
    {
        active: true,
        name: "Ippoldtowie",
        rootIndiId: ["I38"],
    },
    {
        active: true,
        name: "Pizłowie",
        rootIndiId: ["I5"],
    },
    {
        active: true,
        name: "Bieleccy",
        rootIndiId: ["I154"],
    },
    {
        active: true,
        name: "Niziołowie",
        rootIndiId: ["I156"],
    },
    {
        active: true,
        name: "Nowakowie",
        rootIndiId: ["I303"],
    },
    {
        active: true,
        name: "Pinkoszowie",
        rootIndiId: ["I296"],
    },
    {
        active: true,
        name: "Ozimkowie",
        rootIndiId: ["I212", "I214"],
    },
];

export default function Home() {
    const { deviceType } = useDeviceDetect();
    const { query, searchResults, search, clear } = useGlobalSearch();
    const navigate = useNavigate();

    const [searchOpen, setSearchOpen] = useState(false);
    const [branches, setBranches] = useState(defaultBranches);
    const deferredBranches = useDeferredValue(branches);

    const dockedContainer = searchOpen && searchResults.length > 0;
    const moreResultsText = searchResults.length > 5;
    const inactiveBranches = deferredBranches.filter((branch) => !branch.active).flatMap((branch) => branch.rootIndiId);
    const renderedBranches = deferredBranches.filter((branch) => branch.active).map((branch) => branch.name);

    const toggleBranch = (branchName: string) => {
        const copy = structuredClone(branches);
        const branch = copy.find(({ name }) => name === branchName);
        if (!branch) {
            throw new Error("Branch was not found");
        }
        const userIsAttemptingToRemoveLastActiveBranch = branch.active && renderedBranches.length === 1;
        if (userIsAttemptingToRemoveLastActiveBranch) {
            return;
        }
        branch.active = !branch.active;
        setBranches(copy);
    };

    return (
        <>
            <div
                className={clsx({
                    [styles.home_desktop as unknown as string]: deviceType === DeviceType.DESKTOP,
                    [styles.home as unknown as string]: deviceType === DeviceType.MOBILE,
                })}
            >
                {deviceType === DeviceType.DESKTOP && (
                    <div className={styles.input_wrapper}>
                        <div className={styles.input}>
                            <input
                                autoComplete="off"
                                name="global_search"
                                className={clsx(styles.search, {
                                    [styles.open_search as unknown as string]: dockedContainer,
                                })}
                                type="text"
                                placeholder="Szukaj"
                                value={query}
                                onChange={(e) => {
                                    search(e.target.value);
                                }}
                                onFocus={() => {
                                    setSearchOpen(true);
                                }}
                                onBlur={() => {
                                    setSearchOpen(false);
                                }}
                            />
                            <div className={styles.leading_icon}>
                                <span className={clsx("material-symbols-outlined", styles.leading_icon_style)}>
                                    search
                                </span>
                            </div>
                            <div className={styles.docked_container}>
                                {dockedContainer && (
                                    <>
                                        <div className={styles.search_list}>
                                            {searchResults.slice(0, 5).map((person) => (
                                                <button
                                                    key={person.id}
                                                    type="button"
                                                    className={clsx(styles.search_list_item, {
                                                        [styles.has_last_list_element as unknown as string]:
                                                            !moreResultsText,
                                                    })}
                                                    onMouseDown={() => {
                                                        void navigate(`/osoby/${person.id}`);
                                                        clear();
                                                    }}
                                                >
                                                    {person.firstName} {person.nickName} {person.lastName}
                                                </button>
                                            ))}
                                        </div>
                                        {moreResultsText && (
                                            <>
                                                <div className={styles.break_line} />
                                                <button
                                                    className={clsx(
                                                        styles.search_list_item,
                                                        styles.has_last_list_element,
                                                    )}
                                                    onMouseDown={() => {
                                                        void navigate(`${RouterPath.OSOBY}?search=${query}`);
                                                        clear();
                                                    }}
                                                >
                                                    Zobacz pozostałe wyniki ({searchResults.length - 5})
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div
                    className={clsx({
                        [styles.desktop_tree as unknown as string]: deviceType === DeviceType.DESKTOP,
                        [styles.tree as unknown as string]: deviceType === DeviceType.MOBILE,
                    })}
                >
                    <div className={styles.tree_settings}>
                        <MdIconButton iconName="settings" command="show-modal" commandfor="graph_settings" />
                    </div>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <HeritageGraph inactiveBranches={inactiveBranches} />
                    </ErrorBoundary>
                </div>
            </div>
            <dialog id="graph_settings" className={styles.dialog}>
                <SVGSettings branches={branches} toggleBranch={toggleBranch} />
            </dialog>
        </>
    );
}
