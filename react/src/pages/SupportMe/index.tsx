import { Clipboard } from "@/components/ui/clipboard";

const BANK_ACCOUNT_NUMBER = "47 1140 2004 0000 3202 8322 9234";

export function SupportMe() {
    return (
        <div className="flex flex-col justify-center gap-4 px-8 py-6 max-w-(--breakpoint-lg) m-auto">
            <p>
                Strona sama w sobie nie zarabia nic, ale jednak opłacać ją trzeba. Jeśli chcecie by
                praca nie poszła na marne i by była tu dalej dostępna wrzućcie &quot;grosza&quot; na
                ten cel by strona mogła działać dalej 🙂
            </p>
            <Clipboard text={BANK_ACCOUNT_NUMBER} />
        </div>
    );
}
