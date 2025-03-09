import * as topola from "topola";
import { ComponentRef, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Settings } from "lucide-react";

import { useHeritage } from "@/contexts/heritageContext";
import { RouterPath } from "@/constants/routePaths";
import { SVGSettings } from "./SVGSettings";
import { transformHeritageDatasetForActiveBranches } from "@/utils/heritage";

const defaultBranches = [
    {
        active: true,
        name: "Ippoldtowie",
        rootIndiId: "I38",
    },
    {
        active: true,
        name: "Pizłowie",
        rootIndiId: "I5",
    },
    {
        active: true,
        name: "Bieleccy",
        rootIndiId: "I154",
    },
    {
        active: true,
        name: "Niziołowie",
        rootIndiId: "I156",
    },
    {
        active: true,
        name: "Nowakowie",
        rootIndiId: "I303",
    },
    {
        active: true,
        name: "Pinkoszowie",
        rootIndiId: "I296",
    },
    {
        active: true,
        name: "Ozimkowie",
        rootIndiId: "I212",
    },
];

export default function Home() {
    const { heritage } = useHeritage();
    const navigate = useNavigate();

    const svgElement = useRef<ComponentRef<"svg">>(null);
    const [branches, setBranches] = useState(defaultBranches);
    const [settingsAreOpen, setSettingsAreOpen] = useState(false);

    const renderedBranches = branches
        .filter((branch) => branch.active)
        .map((branch) => branch.name);

    useEffect(() => {
        if (!heritage) {
            return;
        }
        if (settingsAreOpen) {
            return;
        }
        const svgRef = svgElement.current;
        const inactiveBranches = branches
            .filter((branch) => !branch.active)
            .map((branch) => branch.rootIndiId);
        const heritageDatasetWithFilteredBranches = transformHeritageDatasetForActiveBranches(
            heritage,
            inactiveBranches,
        );
        topola
            .createChart({
                json: heritageDatasetWithFilteredBranches,
                svgSelector: "#relative",
                chartType: topola.HourglassChart,
                renderer: topola.SimpleRenderer,
                indiCallback(data) {
                    void navigate(`${RouterPath.OSOBY}/${data.id}`);
                },
            })
            .render();
        return () => {
            if (!svgRef) {
                throw new Error("cannot cleanup svg element");
            }
            svgRef.replaceChildren();
        };
    }, [heritage, settingsAreOpen, branches, navigate]);

    function openSVGSettingsView() {
        setSettingsAreOpen(true);
    }

    function closeSVGSettingsView() {
        setSettingsAreOpen(false);
    }

    const toggleBranch = useCallback(
        (branchName: string) => {
            const copy = structuredClone(branches);
            const branch = copy.find(({ name }) => name === branchName);
            if (!branch) {
                throw new Error("Branch was not found");
            }
            const userIsAttemptingToRemoveLastActiveBranch =
                branch.active && renderedBranches.length === 1;
            if (userIsAttemptingToRemoveLastActiveBranch) {
                return;
            }
            branch.active = !branch.active;
            setBranches(copy);
        },
        [branches, renderedBranches.length],
    );

    return (
        <div className="h-full">
            <div className="bg-background h-full flex flex-col">
                {/* ToolBar */}
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
                    <div className="flex border-b border-border p-2 justify-end">
                        <button
                            type="button"
                            className="cursor-pointer p-1 rounded-md"
                            onClick={openSVGSettingsView}
                        >
                            <Settings size={22} />
                        </button>
                    </div>
                )}
                {settingsAreOpen && <SVGSettings branches={branches} toggleBranch={toggleBranch} />}
                {!settingsAreOpen && (
                    <svg
                        ref={svgElement}
                        id="relative"
                        className="cursor-move"
                        height="100%"
                        width="100%"
                    />
                )}
            </div>
        </div>
    );
}
