import { useEffect, useState } from "react";
import { Params, useParams } from "react-router";

import { ENV } from "@/constants/env";
import { useHeritage } from "@/contexts/heritageContext";

type Note = {
    name: string;
    content: string;
};

type NotesJsonResponse = {
    notes: Note[];
};

const notesRoute = (personId: string) => `${ENV.API_URL}/people/${personId}/notes`;

export function Notes() {
    const { id } = useParams<Params>();
    const { heritage } = useHeritage();

    const [notes, setNotes] = useState<Note[]>([]);

    useEffect(() => {
        async function fetchFileNames() {
            if (!id) {
                return;
            }
            const request = await fetch(notesRoute(id));
            if (!request.ok) {
                return;
            }
            const response = (await request.json()) as NotesJsonResponse;
            setNotes(response.notes);
        }
        if (!id) {
            return;
        }
        void fetchFileNames();
    }, [id]);

    if (!id) {
        throw new Error("expected person id");
    }

    if (!heritage) {
        return null;
    }

    if (!notes.length) {
        return (
            <div>
                <h2 className="text-center font-semibold my-10">Brak notatek</h2>
            </div>
        );
    }
    
    return (
        <div className="p-2 mt-2">
            <ul className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(150px,400px))] justify-center">
                {notes.map(({ name, content }) => (
                    <li key={name} className="p-4 bg-white rounded-lg">
                        <h3 className="text-xl text-center mb-2">{name}</h3>
                        <div dangerouslySetInnerHTML={{ __html: content }}></div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
