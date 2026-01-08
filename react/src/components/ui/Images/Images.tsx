import { ComponentRef, createContext, ReactElement, TouchEvent, useContext, useEffect, useRef, useState } from "react";
import { CircleArrowLeft, CircleArrowRight, CircleX, ImageDown } from "lucide-react";

import { SWIPE_THRESHOLD } from "@/constants/config";
import { stripFileExtension } from "@/lib/utils";
import type { File } from "@/pages/Person/types.ts";

import styles from "./styles.module.css";

type ReactChildren = {
    children: ReactElement | ReactElement[];
};

type DialogContextType = {
    dialogRef: React.RefObject<HTMLDialogElement | null>;
    imageIsInspected: boolean;
    inspectedImage: File | null;
    setImage: (image: File) => void;
    closeInspection: () => void;
    openInspection: (file: File) => void;
};

const DialogContext = createContext<DialogContextType>({
    dialogRef: { current: null },
    imageIsInspected: false,
    inspectedImage: null,
    setImage: () => {
        throw new Error("unimplmeneted");
    },
    openInspection: () => {
        throw new Error("unimplmeneted");
    },
    closeInspection: () => {
        throw new Error("unimplmeneted");
    },
});

function useDialogContext() {
    return useContext(DialogContext);
}

export function Images({ children }: ReactChildren) {
    const dialogRef = useRef<ComponentRef<"dialog">>(null);
    const [imageIsInspected, setImageIsInspected] = useState<boolean>(false);
    const [inspectedImage, setInspectedImage] = useState<File | null>(null);

    const openInspection = (file: File) => {
        if (!dialogRef.current) {
            throw new Error("dialog ref was not set properly");
        }
        dialogRef.current.showModal();
        setImageIsInspected(true);
        setInspectedImage(file);
    };

    const closeInspection = () => {
        if (!dialogRef.current) {
            throw new Error("dialog ref was not set properly");
        }
        dialogRef.current.close();
        setInspectedImage(null);
        setImageIsInspected(false);
    };

    const setImage = (image: File) => {
        setInspectedImage(image);
    };

    const provider: DialogContextType = {
        dialogRef,
        imageIsInspected,
        inspectedImage,
        openInspection,
        closeInspection,
        setImage,
    };

    return <DialogContext.Provider value={provider}>{children}</DialogContext.Provider>;
}

export function ImagesThumbnails({ children }: ReactChildren) {
    return <div className={styles.imagesThumbnails}>{children}</div>;
}

type ThumbnailProps = {
    file: File;
};
export function Thumbnail({ file }: ThumbnailProps) {
    const { openInspection: openDialog } = useDialogContext();
    return (
        <button type="button" className={styles.thumbnailButton} onClick={() => openDialog(file)}>
            <figure className={styles.figure}>
                <img src={file.thumbnailSrc} alt={file.filename} className={styles.thumbImg} loading="lazy" />
                <figcaption className={styles.figcaption}>{stripFileExtension(file.filename)}</figcaption>
            </figure>
        </button>
    );
}

type ImageInspectionProps = {
    allFiles: File[];
};
export function ImageInspection({ allFiles }: ImageInspectionProps) {
    const { dialogRef, inspectedImage, setImage } = useDialogContext();

    const moveToNextImage = () => {
        if (!inspectedImage) {
            throw new Error("image must be inspected to find prev");
        }

        const currentImageIndex = allFiles.findIndex((image) => image.filename === inspectedImage.filename);

        const imageIndexNotFound = currentImageIndex === -1;
        if (imageIndexNotFound) {
            throw new Error("could not find image");
        }

        const lastImageOnList = currentImageIndex === allFiles.length - 1;
        if (lastImageOnList) {
            const firstImage = allFiles.at(0);
            if (!firstImage) {
                throw new Error("no image");
            }
            setImage(firstImage);
            return;
        }

        const nextImage = allFiles.at(currentImageIndex + 1);
        if (!nextImage) {
            throw new Error("no image");
        }

        setImage(nextImage);
    };

    const moveToPrevImage = () => {
        if (!inspectedImage) {
            throw new Error("image must be inspected to find prev");
        }

        const currentImageIndex = allFiles.findIndex((image) => inspectedImage.filename === image.filename);
        const imageIndexNotFound = currentImageIndex === -1;
        if (imageIndexNotFound) {
            throw new Error("could not find image");
        }

        const firstImageOnList = currentImageIndex === allFiles.length;
        if (firstImageOnList) {
            const lastImage = allFiles.at(-1);
            if (!lastImage) {
                throw new Error("empty image list");
            }
            setImage(lastImage);
            return;
        }

        const prevImage = allFiles.at(currentImageIndex - 1);
        if (!prevImage) {
            throw new Error("no image");
        }

        setImage(prevImage);
    };

    return (
        <dialog ref={dialogRef} className={styles.dialog}>
            <Image moveToNextImage={moveToNextImage} moveToPrevImage={moveToPrevImage} />
        </dialog>
    );
}

type ImageProps = {
    moveToNextImage: () => void;
    moveToPrevImage: () => void;
};
function Image({ moveToNextImage, moveToPrevImage }: ImageProps) {
    const { imageIsInspected, inspectedImage, closeInspection } = useDialogContext();
    const touchStartCoordinateRef = useRef(0);
    const touchEndCoordinateRef = useRef(0);

    function handleTouchStart(event: TouchEvent<HTMLImageElement>) {
        // @ts-expect-error I expect browser to always return list with coords
        const x = event.targetTouches[0].clientX;
        touchStartCoordinateRef.current = x;
        touchEndCoordinateRef.current = x;
    }

    function handleTouchMove(event: TouchEvent<HTMLImageElement>) {
        // @ts-expect-error I expect browser to always return list with coords
        const x = event.targetTouches[0].clientX;
        touchEndCoordinateRef.current = x;
    }

    function handleTouchEnd() {
        const startX = touchStartCoordinateRef.current;
        const endX = touchEndCoordinateRef.current;

        const swipedToTheRight = startX - endX > SWIPE_THRESHOLD;
        if (swipedToTheRight) {
            moveToNextImage();
            return;
        }

        const swipedToTheLeft = startX - endX < -SWIPE_THRESHOLD;
        if (swipedToTheLeft) {
            moveToPrevImage();
            return;
        }
    }

    // switch photos on arrow press
    useEffect(() => {
        const switchPhotosOnKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                moveToPrevImage();
            }
            if (event.key === "ArrowRight") {
                moveToNextImage();
            }
        };
        // use abort controller? https://www.youtube.com/shorts/Z09xJq5iA0c
        window.addEventListener("keydown", switchPhotosOnKeyDown);
        return () => {
            window.removeEventListener("keydown", switchPhotosOnKeyDown);
        };
    }, [moveToNextImage, moveToPrevImage]);

    if (!imageIsInspected) {
        return null;
    }

    if (!inspectedImage) {
        throw new Error("no image path found on inspected image");
    }

    // TITLE bottom-0 VS fixed bottom-[10px]
    // LEFT ARROW absolute left-[20px] VS fixed left-[25px]
    // RIGHT ARROW absolute right-[20px] VS fixed right-[40px]
    // CLOSE top-[15px] right-[15px] VS fixed top-[25px] right-[40px]

    return (
        <>
            <span className={styles.inspectionTitle}>{stripFileExtension(inspectedImage.filename)}</span>
            <button type="button" className={styles.closeButton} onClick={closeInspection}>
                <CircleX />
            </button>
            <button type="button" className={`${styles.arrowButton} ${styles.arrowLeft}`} onClick={moveToNextImage}>
                <CircleArrowLeft />
            </button>
            <button type="button" className={`${styles.arrowButton} ${styles.arrowRight}`} onClick={moveToPrevImage}>
                <CircleArrowRight />
            </button>
            <a href={inspectedImage.fullSizeSrc} download={inspectedImage.filename}>
                <button type="button" className={styles.downloadButton}>
                    <ImageDown />
                </button>
            </a>
            <img
                className={styles.inspectedImg}
                src={inspectedImage.fullSizeSrc}
                alt={inspectedImage.filename}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            />
        </>
    );
}
