import { useEffect, useState } from "react";
import { Params, useParams } from "react-router";

import { ENV } from "@/constants/env";
import { stripFileExtension } from "@/lib/utils";
import { useHeritage } from "@/contexts/heritageContext";

type UserData = {
    files: string[];
};

function makeDocumentsRoute(personId: string) {
    return `${ENV.API_URL}/people/${personId}/documents`;
}

export function Documents() {
    const { id: personId } = useParams<Params>();
    const { heritage } = useHeritage();

    const [filenames, setFilenames] = useState<string[]>([]);

    useEffect(() => {
        async function fetchFileNames() {
            if (!personId) {
                return;
            }
            const request = await fetch(makeDocumentsRoute(personId));
            if (!request.ok) {
                return;
            }
            const response = (await request.json()) as UserData;
            setFilenames(response.files);
        }
        if (!personId) {
            return;
        }
        void fetchFileNames();
    }, [personId]);

    if (!personId) {
        throw new Error("missing person id");
    }
    if (!heritage) {
        return null;
    }
    if (!filenames.length) {
        return (
            <div>
                <h2 className="text-center font-semibold my-3">Brak dokumentów</h2>
            </div>
        );
    }
    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 ld:grid-cols-5 gap-3 mx-4 mb-4">
                {filenames.map((filename) => (
                    <a
                        key={filename}
                        target="_blank"
                        rel="noreferrer"
                        href={`${ENV.API_URL}/public/${personId}/documents/${filename}`}
                    >
                        <figure className="bg-background rounded-md shadow-md">
                            <img
                                src={`${ENV.API_URL}/public/${personId}/documents/${filename}`}
                                alt={filename}
                                className="rounded-t-md"
                            />
                            <figcaption className="text-center p-1 text-nowrap overflow-hidden text-ellipsis text-sm">
                                {stripFileExtension(filename)}
                            </figcaption>
                        </figure>
                    </a>
                ))}
            </div>
        </div>
    );
}
