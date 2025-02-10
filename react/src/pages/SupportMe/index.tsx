import { Clipboard } from "@/components/ui/clipboard";

const BANK_ACCOUNT_NUMBER = "47 1140 2004 0000 3202 8322 9234";

export function SupportMe() {
    return (
        <div className="flex flex-col justify-center gap-4 px-8 py-6 max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl m-auto">
            <p>
                Strona sama w sobie nie zarabia nic, ale jednak opłacać ją trzeba. Jeśli chcecie by
                praca nie poszła na marne i by była tu dalej dostępna wrzućcie &quot;grosza&quot; na
                ten cel by strona mogła działać dalej 🙂
            </p>
            <Clipboard className="mt-4" text={BANK_ACCOUNT_NUMBER} />
        </div>
    );
}
