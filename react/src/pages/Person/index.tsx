import { useEffect, useState } from "react";
import { Params, useNavigate, useParams } from "react-router";

import { useHeritage } from "@/contexts/heritageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Basic } from "./Basic";
import { Tree } from "./Tree";
import { Photos } from "./Photos";
import { Documents } from "./Documents";
import { Notes } from "./Notes";

export default function Person() {
    const navigate = useNavigate();
    const { id } = useParams<Params>();
    const { heritage } = useHeritage();

    const [personLoaded, setPersonLoaded] = useState(false);

    useEffect(() => {
        if (!id) {
            void navigate("/404", { replace: true });
            return;
        }
        if (!heritage) {
            void navigate("/404", { replace: true });
            return;
        }
        const person = heritage.indis.find((person) => person.id === id);
        if (!person) {
            void navigate("/404", { replace: true });
        }
        setPersonLoaded(true);
    }, [heritage, id, navigate]);

    if (!personLoaded) {
        return null;
    }

    return (
        <Tabs defaultValue="basic" className="mt-1">
            <div className="overflow-x-auto m-1">
                <TabsList className="flex justify-start p-0">
                    <TabsTrigger className="grow" value="basic">
                        Informacje
                    </TabsTrigger>
                    <TabsTrigger className="grow" value="tree">
                        Drzewo
                    </TabsTrigger>
                    <TabsTrigger className="grow" value="photos">
                        Zdjęcia
                    </TabsTrigger>
                    <TabsTrigger className="grow" value="documents">
                        Dokumenty
                    </TabsTrigger>
                    <TabsTrigger className="grow" value="notes">
                        Notatki
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="basic">
                <Basic />
            </TabsContent>
            <TabsContent className="h-[90%]" value="tree">
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
    );
}
