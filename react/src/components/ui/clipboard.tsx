import { ClipboardCopy } from "lucide-react";

type ClipboardProps = {
    text: string;
};
export function Clipboard({ text }: ClipboardProps) {
    function copyToClipboard() {
        void navigator.clipboard.writeText(text);
    }
    return (
        <div className="m-auto flex items-center w-fit gap-3 text-lg bg-background py-2 px-3 border border-border rounded-lg">
            <p>{text}</p>
            <button
                className="bg-background-darker p-1 rounded-lg cursor-pointer"
                type="button"
                onClick={copyToClipboard}
            >
                <ClipboardCopy size={26} />
            </button>
        </div>
    );
}
