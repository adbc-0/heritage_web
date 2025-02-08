import { ClipboardCopy } from "lucide-react";

const BANK_ACCOUNT_NUMBER = "47 1140 2004 0000 3202 8322 9234";

export function SupportMe() {
    function copyToClipboard() {
        void navigator.clipboard.writeText(BANK_ACCOUNT_NUMBER);
    }

    return (
        <div className="flex flex-col justify-center gap-4 px-8 py-6 max-w-(--breakpoint-lg) m-auto">
            <p>
                Strona sama w sobie nie zarabia nic, ale jednak opłacać ją trzeba. Jeśli chcecie by
                praca nie poszła na marne i by była tu dalej dostępna wrzućcie &quot;grosza&quot; na
                ten cel by strona mogła działać dalej 🙂
            </p>
            <div className="flex justify-center items-center gap-3 text-lg">
                <p>Cel: {BANK_ACCOUNT_NUMBER}</p>
                <button
                    className="bg-gray-200 p-1 rounded-lg"
                    type="button"
                    onClick={copyToClipboard}
                >
                    <ClipboardCopy size={26} />
                </button>
            </div>
        </div>
    );
}
