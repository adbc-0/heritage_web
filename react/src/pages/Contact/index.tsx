import { ClipboardCopy } from "lucide-react";

const CONTACT_MAIL = "m.b.ozimek@gmail.com";

export function Contact() {
    function copyToClipboard() {
        void navigator.clipboard.writeText(CONTACT_MAIL);
    }

    return (
        <div className="flex flex-col justify-center gap-4 px-8 py-6 max-w-(--breakpoint-lg) m-auto">
            <p>
                Napisz do mnie jeśli masz jakieś informacje, które chciał/abyś zamieścić na stronie.
            </p>
            <p>Zdjęcia, ciekawostki, dokumenty. Zbieram wszystko co posiadasz 🙂</p>
            <div className="flex justify-center items-center gap-3 text-lg">
                <p>{CONTACT_MAIL}</p>
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
