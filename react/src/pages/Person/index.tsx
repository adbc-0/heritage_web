import { useEffect } from "react";
import { Params, useNavigate, useParams } from "react-router";

import { useHeritage } from "@/features/heritageData/heritageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Basic } from "./Basic";
import { Tree } from "./Tree";
import { Photos } from "./Photos";
import { Documents } from "./Documents";
import { Notes } from "./Notes";
import { isNil } from "@/lib/utils";

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
        <Tabs defaultValue="basic" className="flex flex-col h-full sm:pt-3">
            <div className="flex overflow-x-auto sm:justify-center">
                <TabsList className="bg-background grow rounded-none sm:grow-0 sm:rounded-lg">
                    <TabsTrigger className="grow cursor-pointer data-[state=active]:bg-background-darker" value="basic">
                        Informacje
                    </TabsTrigger>
                    <TabsTrigger className="grow cursor-pointer data-[state=active]:bg-background-darker" value="tree">
                        Drzewo
                    </TabsTrigger>
                    <TabsTrigger
                        className="grow cursor-pointer data-[state=active]:bg-background-darker"
                        value="photos"
                    >
                        Zdjęcia
                    </TabsTrigger>
                    <TabsTrigger
                        className="grow cursor-pointer data-[state=active]:bg-background-darker"
                        value="documents"
                    >
                        Dokumenty
                    </TabsTrigger>
                    <TabsTrigger className="grow cursor-pointer data-[state=active]:bg-background-darker" value="notes">
                        Notatki
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent className="m-0" value="basic">
                <Basic />
            </TabsContent>
            <TabsContent className="m-0 sm:mt-3 grow" value="tree">
                <Tree />
            </TabsContent>
            <TabsContent className="m-0" value="photos">
                <Photos />
            </TabsContent>
            <TabsContent className="m-0" value="documents">
                <Documents />
            </TabsContent>
            <TabsContent className="m-0" value="notes">
                <Notes />
            </TabsContent>
        </Tabs>
    );
}
