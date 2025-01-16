import { useEffect, useState } from "react";
import { Params, useParams } from "react-router";

import { ENV } from "@/constants/env";
import { useHeritage } from "@/contexts/heritageContext";

type UserData = {
    files: string[];
};

const galleryRoute = (personId: string) => `${ENV.API_URL}/people/${personId}/gallery`;

export function Gallery() {
    const { id } = useParams<Params>();
    const { heritage } = useHeritage();

    const [links, setLinks] = useState<string[]>([]);

    useEffect(() => {
        async function fetchFileNames() {
            if (!id) {
                return;
            }
            const request = await fetch(galleryRoute(id));
            if (!request.ok) {
                return;
            }
            const response = (await request.json()) as UserData;
            setLinks(response.files);
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
    if (!links.length) {
        return (
            <div>
                <h2 className="text-center font-semibold my-3">Brak zdjęć</h2>
            </div>
        );
    }
    return (
        <div>
            <div className="grid grid-cols-5 gap-3 mx-4 mb-4">
                {links.map((link) => (
                    <a
                        key={link}
                        target="_blank"
                        rel="noreferrer"
                        href={`${ENV.API_URL}/assets/people/I84/${link}`}
                    >
                        <img src={`${ENV.API_URL}/assets/people/I84/${link}`} alt="unknown" />
                    </a>
                ))}
            </div>
        </div>
    );
}
