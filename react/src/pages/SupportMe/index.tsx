import styles from "./styles.module.css";

const BANK_ACCOUNT_NUMBER = "47 1140 2004 0000 3202 8322 9234";

export default function SupportMe() {
    return (
        <div className={styles.support_me}>
            <h1 className={styles.title}>Wspomóż mnie</h1>
            <div className={styles.content}>
                <p>
                    Strona sama w sobie nie zarabia nic, ale jednak opłacać ją trzeba. Jeśli chcecie by praca nie poszła
                    na marne i by była tu dalej dostępna wrzućcie &quot;grosza&quot; na ten cel by strona mogła działać
                    dalej 🙂
                </p>
                <p className={styles.highlighted}>{BANK_ACCOUNT_NUMBER}</p>
            </div>
        </div>
    );
}
