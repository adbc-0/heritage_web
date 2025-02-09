import { ComponentRef, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, CircleX } from "lucide-react";
import * as topola from "topola";

import { useHeritage } from "@/contexts/heritageContext";
import { transformHeritageDatasetForActiveBranches } from "@/utils/heritage";
import { RouterPath } from "@/constants/routePaths";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const SELECT_LIMIT = 2;
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

export default function Branches() {
    const navigate = useNavigate();
    const { heritage } = useHeritage();
    const branchMultiselectId = useId();
    const ariaDropdownControls = useId();
    const svgElement = useRef<ComponentRef<"svg">>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [branches, setBranches] = useState(defaultBranches);
    const renderedBranches = branches
        .filter((branch) => branch.active)
        .map((branch) => branch.name);

    useEffect(() => {
        if (!heritage) {
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
    }, [branches, heritage, navigate]);

    function toggleBranch(branchName: string) {
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
    }

    function removeActiveBranchWithIcon(
        event: React.MouseEvent<SVGSVGElement>,
        branchName: string,
    ) {
        event.preventDefault();
        toggleBranch(branchName);
    }

    return (
        <div className="grid grid-rows-[auto_1fr]">
            <div className="flex flex-col items-center gap-2 justify-center mt-4">
                <p id={branchMultiselectId}>Wyświetlane gałęzie</p>
                <Popover
                    open={dropdownOpen}
                    onOpenChange={(newStatus) => {
                        setDropdownOpen(newStatus);
                    }}
                >
                    <PopoverTrigger>
                        <div
                            aria-labelledby={branchMultiselectId}
                            className="flex justify-center items-center bg-background border border-border rounded-md p-1 pr-2 mx-3"
                            role="combobox"
                            aria-controls={ariaDropdownControls}
                            aria-expanded={false}
                            aria-haspopup="listbox"
                            tabIndex={-1}
                        >
                            <div className="flex justify-center flex-wrap gap-1">
                                {renderedBranches.slice(0, SELECT_LIMIT).map((name) => (
                                    <Badge key={name} className="h-8 gap-2" aria-label={name}>
                                        {name}
                                        <CircleX
                                            size={20}
                                            onClick={(event) => {
                                                removeActiveBranchWithIcon(event, name);
                                            }}
                                        />
                                    </Badge>
                                ))}
                                {renderedBranches.length > 2 && (
                                    <span className="h-8 text-nowrap text-xs font-medium content-center text-primary mx-1">
                                        +{renderedBranches.length - 2} więcej
                                    </span>
                                )}
                            </div>
                            <ChevronDown className="ml-2" color="grey" size={20} />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent id={ariaDropdownControls} className="flex flex-row p-0">
                        <div className="w-full">
                            {branches.map(({ name: branchName, active }) => (
                                <div key={branchName} className="hover:bg-accent">
                                    <div className="flex items-center gap-2 p-1 mx-2">
                                        <Checkbox
                                            checked={active}
                                            onClick={() => {
                                                toggleBranch(branchName);
                                            }}
                                        />
                                        <Button
                                            className="w-full rounded-none p-0 text-left justify-start"
                                            variant="ghost"
                                            type="button"
                                            onClick={() => {
                                                toggleBranch(branchName);
                                            }}
                                        >
                                            {branchName}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="bg-background m-3 border border-border">
                <svg ref={svgElement} id="relative" className="cursor-move" />
            </div>
        </div>
    );
}
