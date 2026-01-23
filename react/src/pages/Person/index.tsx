import { useEffect } from "react";
import { Params, useNavigate, useParams } from "react-router";

import { isNil } from "@/lib/utils";
import { useHeritage } from "@/features/heritageData/heritageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/MdTabs";

import { Basic } from "./Basic";
import { Tree } from "./Tree";
import { Photos } from "./Photos";
import { Documents } from "./Documents";
import { Notes } from "./Notes";

import styles from "./styles.module.css";
import { RouterPath } from "@/constants/routePaths";

const PersonTabs = {
    BASIC: "BASIC",
    TREE: "TREE",
    PHOTOS: "PHOTOS",
    DOCUMENTS: "DOCUMENTS",
    NOTES: "NOTES",
};

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
            void navigate(RouterPath.NOT_FOUND, { replace: true });
            return;
        }
        if (person.type === "EMPTY_NODE") {
            void navigate(RouterPath.NOT_FOUND, { replace: true });
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
            <Tabs defaultValue={PersonTabs.BASIC} className={styles.tabs_wrapper}>
                <div className={styles.tabs_scroller}>
                    <TabsList className={styles.tabs}>
                        <TabsTrigger className={styles.tab} value={PersonTabs.BASIC}>
                            Informacje
                        </TabsTrigger>
                        <TabsTrigger className={styles.tab} value={PersonTabs.TREE}>
                            Drzewo
                        </TabsTrigger>
                        <TabsTrigger className={styles.tab} value={PersonTabs.PHOTOS}>
                            Zdjęcia
                        </TabsTrigger>
                        <TabsTrigger className={styles.tab} value={PersonTabs.DOCUMENTS}>
                            Dokumenty
                        </TabsTrigger>
                        <TabsTrigger className={styles.tab} value={PersonTabs.NOTES}>
                            Notatki
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value={PersonTabs.BASIC}>
                    <Basic />
                </TabsContent>
                <TabsContent value={PersonTabs.TREE} className={styles.grow}>
                    <Tree />
                </TabsContent>
                <TabsContent value={PersonTabs.PHOTOS}>
                    <Photos />
                </TabsContent>
                <TabsContent value={PersonTabs.DOCUMENTS}>
                    <Documents />
                </TabsContent>
                <TabsContent value={PersonTabs.NOTES}>
                    <Notes />
                </TabsContent>
            </Tabs>
        </div>
    );
}
