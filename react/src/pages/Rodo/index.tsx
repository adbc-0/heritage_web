import styles from "./styles.module.css";

export default function Rodo() {
    return (
        <div className={styles.rodo}>
            <h1 className={styles.title}>RODO</h1>
            <div className={styles.content}>
                <p>
                    Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 roku,
                    przekazuje w motywie 27. preambuły, że “Niniejsze rozporządzenie nie ma zastosowania do danych
                    osobowych osób zmarłych.” Natomiast jeśli chodzi o przetwarzanie danych osobowych osób żyjących,
                    strona została objęta hasłem, dlatego by postronne osoby nie znające go nie mogły uczestniczyć w
                    pobieraniu i przetwarzaniu danych znajdujących się na stronie.
                </p>
                <p>
                    W kontekście braku chęci uczestniczenia w tym przedsięwzięciu proszę o zgłoszenie się bezpośrednio
                    do autorki strony.
                </p>
            </div>
        </div>
    );
}
