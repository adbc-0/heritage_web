import { useEffect, useState } from "react";
import { Params, useParams } from "react-router";

import { ENV } from "@/constants/env";
import { useHeritage } from "@/features/heritageData/heritageContext";

import styles from "./styles.module.css";

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
                <h2 className={styles.no_content}>Brak notatek</h2>
            </div>
        );
    }

    return (
        <div>
            <ul>
                {notes.map(({ name, content }) => (
                    <li key={name}>
                        <h3>{name}</h3>
                        <div dangerouslySetInnerHTML={{ __html: content }}></div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
