import { useEffect, useState } from "react";
import { Params, useParams } from "react-router";

import { ENV } from "@/constants/env";
import { useHeritage } from "@/features/heritageData/heritageContext";
import { ImageInspection, Images, ImagesThumbnails, Thumbnail } from "@/components/ui/images";

import type { File } from "@/pages/Person/types.ts";

import styles from "./styles.module.css";

type UserData = {
    files: string[];
};

function getFilenamesRoute(personId: string) {
    return `${ENV.API_URL}/people/${personId}/gallery`;
}

function createFullSrc(personId: string, filename: string) {
    return `${ENV.API_URL}/public/${personId}/photos/${filename}`;
}

function createThumbnailSrc(personId: string, filename: string) {
    return `${ENV.API_URL}/public/${personId}/photos/thumbnails/${filename}`;
}

export function Photos() {
    const { id: personId } = useParams<Params>();
    const { heritage } = useHeritage();

    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        async function fetchFileNames() {
            if (!personId) {
                return;
            }
            const request = await fetch(getFilenamesRoute(personId));
            if (!request.ok) {
                return;
            }
            const response = (await request.json()) as UserData;
            const files = response.files.map((filename) => ({
                filename,
                fullSizeSrc: createFullSrc(personId, filename),
                thumbnailSrc: createThumbnailSrc(personId, filename),
            }));
            setFiles(files);
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

    if (!files.length) {
        return (
            <div>
                <h2 className={styles.no_content}>Brak zdjęć</h2>
            </div>
        );
    }

    return (
        <Images>
            <ImagesThumbnails>
                {files.map((file) => (
                    <Thumbnail key={file.filename} file={file} />
                ))}
            </ImagesThumbnails>
            <ImageInspection allFiles={files} />
        </Images>
    );
}
