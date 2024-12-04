import { ElementRef, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowDown, CircleX } from "lucide-react";
import * as topola from "topola";

import { useHeritage } from "@/contexts/heritageContext";
import { transformHeritageDatasetForActiveBranches } from "@/utils/heritage";
import { RoutePaths } from "@/constants/RoutePaths";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const SELECT_LIMIT = 2;
const defaultBranches = [
    {
        active: true,
        name: "Ippoldtowie",
        rootIndiId: "I38",
    },
    {
        active: false,
        name: "Pizłowie",
        rootIndiId: "I5",
    },
    {
        active: false,
        name: "Bieleccy",
        rootIndiId: "I154",
    },
    {
        active: false,
        name: "Niziołowie",
        rootIndiId: "I156",
    },
    {
        active: false,
        name: "Nowakowie",
        rootIndiId: "I303",
    },
    {
        active: false,
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
    const heritageDataset = useHeritage();
    const branchMultiselectId = useId();
    const ariaDropdownControls = useId();
    const svgElement = useRef<ElementRef<"svg">>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [branches, setBranches] = useState(defaultBranches);
    const renderedBranches = branches.filter((branch) => branch.active).map((branch) => branch.name);

    useEffect(() => {
        if (!heritageDataset) {
            return;
        }
        const svgRef = svgElement.current;
        const inactiveBranches = branches.filter((branch) => !branch.active).map((branch) => branch.rootIndiId);
        const heritageDatasetWithFilteredBranches = transformHeritageDatasetForActiveBranches(
            heritageDataset,
            inactiveBranches,
        );
        topola
            .createChart({
                json: heritageDatasetWithFilteredBranches,
                svgSelector: "#relative",
                chartType: topola.HourglassChart,
                renderer: topola.SimpleRenderer,
                indiCallback(data) {
                    void navigate(`${RoutePaths.OSOBY}/${data.id}`);
                },
            })
            .render();
        return () => {
            if (!svgRef) {
                throw new Error("cannot cleanup svg element");
            }
            svgRef.replaceChildren();
        };
    }, [branches, heritageDataset, navigate]);

    function toggleBranch(branchName: string) {
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
    }

    function removeActiveBranchWithIcon(event: React.MouseEvent<SVGSVGElement>, branchName: string) {
        event.preventDefault();
        toggleBranch(branchName);
    }

    return (
        <div className="grid grid-rows-[auto_1fr]">
            <div className="flex flex-col items-center gap-2 justify-center mt-4">
                <label className="text-sm" htmlFor={branchMultiselectId}>
                    Wyświetlane gałęzie
                </label>
                <Popover
                    open={dropdownOpen}
                    onOpenChange={(newStatus) => {
                        setDropdownOpen(newStatus);
                    }}
                >
                    <PopoverTrigger>
                        <div
                            className="flex justify-center items-center bg-background border rounded-md py-1 px-3 mx-3"
                            role="combobox"
                            aria-controls={ariaDropdownControls}
                            aria-labelledby={branchMultiselectId}
                            aria-expanded={false}
                            aria-haspopup="listbox"
                            tabIndex={-1}
                        >
                            <div className="flex justify-center flex-wrap gap-1">
                                {renderedBranches.slice(0, SELECT_LIMIT).map((name) => (
                                    <Badge key={name} className="h-8 gap-2">
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
                                    <Badge className="h-8 text-nowrap">+{renderedBranches.length - 2} dodatkowych</Badge>
                                )}
                            </div>
                            <Separator orientation="vertical" className="mx-3 h-6" />
                            <ArrowDown color="grey" size={20} />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent id={ariaDropdownControls} className="flex flex-row">
                        <div className="w-full">
                            {branches.map(({ name: branchName, active }) => (
                                <div key={branchName} className="flex items-center">
                                    <Button
                                        className="w-full border rounded-none"
                                        variant={active ? "default" : "secondary"}
                                        type="button"
                                        onClick={() => {
                                            toggleBranch(branchName);
                                        }}
                                    >
                                        {branchName}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="bg-background m-3 border border-border">
                <svg ref={svgElement} id="relative" />
            </div>
        </div>
    );
}
