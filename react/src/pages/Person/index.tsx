import { useEffect } from "react";
import { Params, useNavigate, useParams } from "react-router";

import { isNil } from "@/lib/utils";
import { useHeritage } from "@/features/heritageData/heritageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Basic } from "./Basic";
import { Tree } from "./Tree";
import { Photos } from "./Photos";
import { Documents } from "./Documents";
import { Notes } from "./Notes";

import styles from "./styles.module.css";

export default function Person() {
    const navigate = useNavigate();
    const { id } = useParams<Params>();
    const { heritage } = useHeritage();

    useEffect(() => {
        if (!id) {
            throw new Error("missing person route param");
        }

        if (!heritage) {
            throw new Error("missing heritageData data");
        }

        const person = heritage.people.find((person) => person.id === id);
        if (!person) {
            void navigate("/404", { replace: true });
            return;
        }
        if (person.type === "EMPTY_NODE") {
            void navigate("/404", { replace: true });
            return;
        }
    }, [heritage, id, navigate]);

    if (!id) {
        throw new Error("missing person route param");
    }

    if (!heritage) {
        throw new Error("missing heritageData data");
    }

    const person = heritage.people.find((person) => person.id === id);
    if (isNil(person)) {
        return null;
    }

    return (
        <div className={styles.view}>
            <Tabs defaultValue="basic" className={styles.tabs_wrapper}>
                <div className={styles.tabs_scroller}>
                    <TabsList className={styles.tabs}>
                        <TabsTrigger className={styles.tab} value="basic">
                            Informacje
                        </TabsTrigger>
                        <TabsTrigger className={styles.tab} value="tree">
                            Drzewo
                        </TabsTrigger>
                        <TabsTrigger className={styles.tab} value="photos">
                            Zdjęcia
                        </TabsTrigger>
                        <TabsTrigger className={styles.tab} value="documents">
                            Dokumenty
                        </TabsTrigger>
                        <TabsTrigger className={styles.tab} value="notes">
                            Notatki
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="basic">
                    <Basic />
                </TabsContent>
                <TabsContent value="tree" className={styles.grow}>
                    <Tree />
                </TabsContent>
                <TabsContent value="photos">
                    <Photos />
                </TabsContent>
                <TabsContent value="documents">
                    <Documents />
                </TabsContent>
                <TabsContent value="notes">
                    <Notes />
                </TabsContent>
            </Tabs>
        </div>
    );
}
