import { useDeferredValue, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ChevronLeft } from "lucide-react";

import { ErrorFallback, HeritageGraph } from "@/features/heritageGraph/HeritageGraph";

import { SVGSettings } from "./SVGSettings";

import styles from "./styles.module.css";
import { clsx } from "clsx";

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
    const [branches, setBranches] = useState(defaultBranches);
    const deferredBranches = useDeferredValue(branches);
    const [settingsAreOpen, setSettingsAreOpen] = useState(false);

    const inactiveBranches = deferredBranches.filter((branch) => !branch.active).flatMap((branch) => branch.rootIndiId);

    const renderedBranches = deferredBranches.filter((branch) => branch.active).map((branch) => branch.name);

    function openSVGSettingsView() {
        setSettingsAreOpen(true);
    }

    function closeSVGSettingsView() {
        setSettingsAreOpen(false);
    }

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
            <div className={styles.main}>
                <div className={styles.tree}>
                    {settingsAreOpen && (
                        <div className="flex border-b border-border p-2 justify-end">
                            <button
                                type="button"
                                className="cursor-pointer p-1 rounded-md"
                                onClick={closeSVGSettingsView}
                            >
                                <ChevronLeft size={22} />
                            </button>
                        </div>
                    )}
                    {!settingsAreOpen && (
                        <div className={styles.tree_settings}>
                            <button
                                type="button"
                                className={clsx("material-symbols-outlined", styles.icon_button)}
                                command="show-modal"
                                commandFor="graph_settings"
                            >
                                settings
                            </button>
                        </div>
                    )}
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
