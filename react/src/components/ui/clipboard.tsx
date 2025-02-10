import { useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";
import { Tooltip } from "./tooltip";

type ClipboardProps = {
    className?: string;
    text: string;
};
export function Clipboard({ text, className }: ClipboardProps) {
    const [textCopiedToClipboard, setTextCopiedToClipboard] = useState(false);

    function copyToClipboard() {
        void navigator.clipboard.writeText(text);
        setTextCopiedToClipboard(true);

        setTimeout(() => {
            setTextCopiedToClipboard(false);
        }, 2_000);
    }

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <div
                    className={cn(
                        "m-auto flex items-center w-fit gap-3 sm:text-lg bg-background py-2 px-3 border border-border rounded-lg",
                        className,
                    )}
                >
                    <p>{text}</p>
                    <TooltipTrigger asChild>
                        <button
                            className="bg-background-darker hover:bg-background-darker/90 p-1 rounded-lg cursor-pointer"
                            type="button"
                            onClick={copyToClipboard}
                        >
                            {textCopiedToClipboard ? (
                                <Check size={26} className="text-primary" />
                            ) : (
                                <ClipboardCopy size={26} />
                            )}
                        </button>
                    </TooltipTrigger>
                </div>
                <TooltipContent sideOffset={5}>
                    <span className="bg-black text-white text-xs p-1.5 rounded-md">
                        Kopiuj do schowka
                    </span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
