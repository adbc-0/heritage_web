import styles from "./styles.module.css";

const CONTACT_MAIL = "m.b.ozimek@gmail.com";

export default function Contact() {
    return (
        <div className={styles.contact}>
            <h1 className={styles.title}>Kontakt</h1>
            <div className={styles.content}>
                <p>Napisz do mnie jeśli masz jakieś informacje, które chciał/abyś zamieścić na stronie.</p>
                <p>Zdjęcia, ciekawostki, dokumenty. Zbieram wszystko co posiadasz 🙂</p>
                <p className={styles.highlighted}>{CONTACT_MAIL}</p>
            </div>
        </div>
    );
}
