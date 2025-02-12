import { Clipboard } from "@/components/ui/clipboard";

const CONTACT_MAIL = "m.b.ozimek@gmail.com";

export default function Contact() {
    return (
        <div className="h-full flex flex-col justify-center gap-4 px-8 py-6 max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl m-auto">
            <p>
                Napisz do mnie jeśli masz jakieś informacje, które chciał/abyś zamieścić na stronie.
            </p>
            <p>Zdjęcia, ciekawostki, dokumenty. Zbieram wszystko co posiadasz 🙂</p>
            <Clipboard className="mx-auto mt-4" text={CONTACT_MAIL} />
        </div>
    );
}
