import { useEffect, useState } from "react";
import { Params, useParams } from "react-router";

import { ENV } from "@/constants/env";
import { useHeritage } from "@/contexts/heritageContext";

type Note = {
    id: string;
    note: string;
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
                <h2 className="text-center font-semibold my-3">Brak danych</h2>
            </div>
        );
    }
    return (
        <div>
            <ul>
                {notes.map(({ id, note }) => (
                    <li key={id}>{note}</li>
                ))}
            </ul>
        </div>
    );
}
