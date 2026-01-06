import { useDeferredValue, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { clsx } from "clsx";

import { ErrorFallback, HeritageGraph } from "@/features/heritageGraph/HeritageGraph";

import { SVGSettings } from "./SVGSettings";

import { useDeviceDetect } from "@/features/deviceMode/deviceModeContext";
import { DeviceType } from "@/features/deviceMode/constants";
import { useGlobalSearch } from "@/features/globalSearch/globalSearch";

import styles from "./styles.module.css";

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
    const { query, searchResults, search } = useGlobalSearch();

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
                    [styles.home_desktop]: deviceType === DeviceType.DESKTOP,
                    [styles.home]: deviceType === DeviceType.MOBILE,
                })}
            >
                {deviceType === DeviceType.DESKTOP && (
                    <div className={styles.input_wrapper}>
                        <div className={styles.input}>
                            <input
                                name="global_search"
                                className={clsx(styles.search, {
                                    [styles.open_search]: dockedContainer,
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
                                                    className={clsx(styles.search_list_item, {
                                                        [styles.has_last_list_element]: !moreResultsText,
                                                    })}
                                                    type="button"
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
                        [styles.desktop_tree]: deviceType === DeviceType.DESKTOP,
                        [styles.tree]: deviceType === DeviceType.MOBILE,
                    })}
                >
                    <div className={styles.tree_settings}>
                        <button
                            type="button"
                            className={clsx("material-symbols-outlined", styles.icon_button)}
                            command="show-modal"
                            commandfor="graph_settings"
                        >
                            settings
                        </button>
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
