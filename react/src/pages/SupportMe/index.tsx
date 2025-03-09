import { Clipboard } from "@/components/ui/clipboard";

const BANK_ACCOUNT_NUMBER = "47 1140 2004 0000 3202 8322 9234";

export default function SupportMe() {
    return (
        <div className="h-full flex flex-col items-center gap-4 px-8 py-8 max-w-xl md:max-w-3xl m-auto">
            <p>
                Strona sama w sobie nie zarabia nic, ale jednak opłacać ją trzeba. Jeśli chcecie by
                praca nie poszła na marne i by była tu dalej dostępna wrzućcie &quot;grosza&quot; na
                ten cel by strona mogła działać dalej 🙂
            </p>
            <Clipboard className="mx-auto mt-4" text={BANK_ACCOUNT_NUMBER} />
        </div>
    );
}
