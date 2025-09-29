import React, { useCallback, useId, useState } from "react";
import { ChevronDown, CircleX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const OPTIONS_DISPLAYED_ON_SELECT = 2;

type Branch = {
    active: boolean;
    name: string;
    rootIndiId: string[];
};

type SVGSettingsProps = {
    branches: Branch[];
    toggleBranch: (branchName: string) => void;
};

export function SVGSettings({ branches, toggleBranch }: SVGSettingsProps) {
    const branchMultiselectId = useId();
    const ariaDropdownControls = useId();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const renderedBranches = branches
        .filter((branch) => branch.active)
        .map((branch) => branch.name);

    function removeActiveBranchWithIcon(
        event: React.MouseEvent<SVGSVGElement>,
        branchName: string,
    ) {
        event.preventDefault();
        toggleBranch(branchName);
    }

    const dropdownKeyListener = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            setDropdownOpen(true);
        }
    }, []);

    const dropdownOptionKeyListener = useCallback(
        (branchName: string) => (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
                toggleBranch(branchName);
            }
        },
        [toggleBranch],
    );

    return (
        <div className="grow bg-background-darker">
            <div className="max-w-2xl m-auto py-6">
                <div className="flex flex-col gap-1 mx-3 max-w-2xl justify-center">
                    <p id={branchMultiselectId} className="text-sm font-medium">
                        Wyświetlane gałęzie
                    </p>
                    <div>
                        <Popover
                            open={dropdownOpen}
                            onOpenChange={(newStatus) => {
                                setDropdownOpen(newStatus);
                            }}
                        >
                            <PopoverTrigger asChild>
                                <div
                                    className="flex justify-center items-center bg-background border border-border rounded-md p-1 pr-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
                                    role="combobox"
                                    aria-labelledby={branchMultiselectId}
                                    aria-controls={ariaDropdownControls}
                                    aria-expanded={dropdownOpen}
                                    aria-haspopup="listbox"
                                    tabIndex={0}
                                    onKeyUp={dropdownKeyListener}
                                >
                                    <div className="flex justify-center flex-wrap gap-1">
                                        {renderedBranches
                                            .slice(0, OPTIONS_DISPLAYED_ON_SELECT)
                                            .map((name) => (
                                                <Badge
                                                    key={name}
                                                    className="h-8 gap-2"
                                                    aria-label={name}
                                                >
                                                    {name}
                                                    <CircleX
                                                        size={20}
                                                        onClick={(event) => {
                                                            removeActiveBranchWithIcon(event, name);
                                                        }}
                                                    />
                                                </Badge>
                                            ))}
                                        {renderedBranches.length > OPTIONS_DISPLAYED_ON_SELECT && (
                                            <span className="h-8 text-nowrap text-xs font-medium content-center text-primary mx-1">
                                                +
                                                {renderedBranches.length -
                                                    OPTIONS_DISPLAYED_ON_SELECT}{" "}
                                                więcej
                                            </span>
                                        )}
                                    </div>
                                    <ChevronDown className="ml-2" color="grey" size={20} />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent
                                id={ariaDropdownControls}
                                className="flex flex-row p-0 border-border"
                            >
                                <div role="list" className="w-full">
                                    {branches.map(({ name: branchName, active }) => (
                                        <div key={branchName} className="hover:bg-accent">
                                            <div
                                                tabIndex={0}
                                                role="checkbox"
                                                aria-checked={active}
                                                className="flex items-center gap-2 py-1 px-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
                                                onClick={() => {
                                                    toggleBranch(branchName);
                                                }}
                                                onKeyUp={dropdownOptionKeyListener(branchName)}
                                            >
                                                <Checkbox
                                                    tabIndex={-1}
                                                    className="cursor-pointer"
                                                    checked={active}
                                                />
                                                <Button
                                                    tabIndex={-1}
                                                    className="cursor-pointer w-full rounded-none p-0 text-left justify-start"
                                                    variant="ghost"
                                                    type="button"
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
                </div>
            </div>
        </div>
    );
}
