import {
    ComponentRef,
    createContext,
    ReactElement,
    TouchEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { CircleArrowLeft, CircleArrowRight, CircleX, ImageDown } from "lucide-react";

import { SWIPE_TRESHOLD } from "@/constants/global";
import { stripFileExtension } from "@/lib/utils";
import { File } from "@/typescript/person";

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

    const openInspection = useCallback((file: File) => {
        if (!dialogRef.current) {
            throw new Error("dialog ref was not set properly");
        }
        dialogRef.current.showModal();
        setImageIsInspected(true);
        setInspectedImage(file);
    }, []);

    const closeInspection = useCallback(() => {
        if (!dialogRef.current) {
            throw new Error("dialog ref was not set properly");
        }
        dialogRef.current.close();
        setInspectedImage(null);
        setImageIsInspected(false);
    }, []);

    const setImage = useCallback((image: File) => {
        setInspectedImage(image);
    }, []);

    const provider: DialogContextType = useMemo(
        () => ({
            dialogRef,
            imageIsInspected,
            inspectedImage,
            openInspection,
            closeInspection,
            setImage,
        }),
        [imageIsInspected, inspectedImage, closeInspection, openInspection, setImage],
    );

    return <DialogContext.Provider value={provider}>{children}</DialogContext.Provider>;
}

export function ImagesThumbnails({ children }: ReactChildren) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 auto-rows-[minmax(auto,200px)] md:auto-rows-[minmax(auto,250px)] xl:auto-rows-[minmax(auto,300px)] gap-6 m-4">
            {children}
        </div>
    );
}

type ThumbnailProps = {
    file: File;
};
export function Thumbnail({ file }: ThumbnailProps) {
    const { openInspection: openDialog } = useDialogContext();
    return (
        <button
            type="button"
            className="bg-background rounded-md shadow-lg"
            onClick={() => {
                openDialog(file);
            }}
        >
            <figure className="flex flex-col h-full cursor-pointer">
                <img
                    src={file.thumbnailSrc}
                    alt={file.filename}
                    className="rounded-t-md grow object-cover h-1"
                    loading="lazy"
                />
                <figcaption className="text-center p-2 text-nowrap overflow-hidden text-ellipsis text-sm">
                    {stripFileExtension(file.filename)}
                </figcaption>
            </figure>
        </button>
    );
}

type ImageInspectionProps = {
    allFiles: File[];
};
export function ImageInspection({ allFiles }: ImageInspectionProps) {
    const { dialogRef, inspectedImage, setImage } = useDialogContext();

    const moveToNextImage = useCallback(() => {
        if (!inspectedImage) {
            throw new Error("image must be inspected to find prev");
        }

        const currentImageIndex = allFiles.findIndex(
            (image) => image.filename === inspectedImage.filename,
        );

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
    }, [allFiles, inspectedImage, setImage]);

    const moveToPrevImage = useCallback(() => {
        if (!inspectedImage) {
            throw new Error("image must be inspected to find prev");
        }

        const currentImageIndex = allFiles.findIndex(
            (image) => inspectedImage.filename === image.filename,
        );
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
    }, [allFiles, inspectedImage, setImage]);

    return (
        <dialog
            ref={dialogRef}
            className="bg-zinc-800 backdrop:bg-black backdrop:bg-opacity-55 h-full w-full rounded-lg m-auto"
        >
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

        const swipedToTheRight = startX - endX > SWIPE_TRESHOLD;
        if (swipedToTheRight) {
            moveToNextImage();
            return;
        }

        const swipedToTheLeft = startX - endX < -SWIPE_TRESHOLD;
        if (swipedToTheLeft) {
            moveToPrevImage();
            return;
        }
    }

    const switchPhotosOnKeyDown = useCallback(
        (event: globalThis.KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                moveToPrevImage();
            }
            if (event.key === "ArrowRight") {
                moveToNextImage();
            }
        },
        [moveToNextImage, moveToPrevImage],
    );

    // switch photos on arrow press
    useEffect(() => {
        window.addEventListener("keydown", switchPhotosOnKeyDown);
        return () => {
            window.removeEventListener("keydown", switchPhotosOnKeyDown);
        };
    }, [switchPhotosOnKeyDown]);

    if (!imageIsInspected) {
        return null;
    }

    if (!inspectedImage) {
        throw new Error("no image path found on inspected image");
    }

    // TITLE bottom-0 VS fixed bottom-[10px]
    // LEFT ARROW absolute left-[20px] VS fixed left-[25px
    // RIGHT ARROW absolute right-[20px] VS fixed right-[40px]
    // CLOSE top-[15px] right-[15px] VS fixed top-[25px] right-[40px]

    return (
        <>
            <span className="absolute bottom-[15px] m-auto left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 p-2 rounded-md">
                {stripFileExtension(inspectedImage.filename)}
            </span>
            <button
                type="button"
                className="cursor-pointer absolute top-[15px] right-[15px] bg-black bg-opacity-50 p-2 rounded-3xl"
                onClick={closeInspection}
            >
                <CircleX />
            </button>
            <button
                type="button"
                className="cursor-pointer absolute left-[20px] top-1/2 select-none bg-black bg-opacity-50 p-2 rounded-3xl"
                onClick={moveToNextImage}
            >
                <CircleArrowLeft />
            </button>
            <button
                type="button"
                className="cursor-pointer absolute right-[20px] top-1/2 select-none bg-black bg-opacity-50 p-2 rounded-3xl"
                onClick={moveToPrevImage}
            >
                <CircleArrowRight />
            </button>
            <a href={inspectedImage.fullSizeSrc} download={inspectedImage.filename}>
                <button
                    type="button"
                    className="cursor-pointer absolute bottom-[15px] right-[15px] bg-black bg-opacity-50 p-2 rounded-md"
                >
                    <ImageDown />
                </button>
            </a>
            <img
                className="w-full h-full object-contain"
                src={inspectedImage.fullSizeSrc}
                alt={inspectedImage.filename}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            />
        </>
    );
}
