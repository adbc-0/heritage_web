import { Clipboard } from "@/components/ui/clipboard";

const CONTACT_MAIL = "m.b.ozimek@gmail.com";

export default function Contact() {
    return (
        <div className="h-full flex flex-col gap-4 px-8 py-8 max-w-xl md:max-w-3xl m-auto">
            <p>
                Napisz do mnie jeśli masz jakieś informacje, które chciał/abyś zamieścić na stronie.
            </p>
            <p>Zdjęcia, ciekawostki, dokumenty. Zbieram wszystko co posiadasz 🙂</p>
            <Clipboard className="mx-auto mt-4" text={CONTACT_MAIL} />
        </div>
    );
}
