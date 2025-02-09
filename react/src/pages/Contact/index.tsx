import { Clipboard } from "@/components/ui/clipboard";

const CONTACT_MAIL = "m.b.ozimek@gmail.com";

export function Contact() {
    return (
        <div className="flex flex-col justify-center gap-4 px-8 py-6 max-w-(--breakpoint-lg) m-auto">
            <p>
                Napisz do mnie jeśli masz jakieś informacje, które chciał/abyś zamieścić na stronie.
            </p>
            <p>Zdjęcia, ciekawostki, dokumenty. Zbieram wszystko co posiadasz 🙂</p>
            <Clipboard text={CONTACT_MAIL} />
        </div>
    );
}
