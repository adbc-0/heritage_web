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
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 auto-rows-[minmax(auto,190px)] gap-3 mx-4 mb-4">
            {children}
        </div>
    );
}

type ThumbnailT = {
    file: File;
};
export function Thumbnail({ file }: ThumbnailT) {
    const { openInspection: openDialog } = useDialogContext();
    return (
        <button
            type="button"
            className="bg-background rounded-md shadow-md"
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
                <figcaption className="text-center p-1 text-nowrap overflow-hidden text-ellipsis text-sm">
                    {stripFileExtension(file.filename)}
                </figcaption>
            </figure>
        </button>
    );
}

type ImageInspectionT = {
    allFiles: File[];
};
export function ImageInspection({ allFiles }: ImageInspectionT) {
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
            className="bg-zinc-800 backdrop:bg-black backdrop:bg-opacity-55 h-full w-full rounded-lg"
        >
            <Image moveToNextImage={moveToNextImage} moveToPrevImage={moveToPrevImage} />
        </dialog>
    );
}

type ImageT = {
    moveToNextImage: () => void;
    moveToPrevImage: () => void;
};
function Image({ moveToNextImage, moveToPrevImage }: ImageT) {
    const { imageIsInspected, inspectedImage, closeInspection } = useDialogContext();
    // ToDo: Improve swiping to not rerender website on coord change. Use ref instead.
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    function handleTouchStart(event: TouchEvent<HTMLImageElement>) {
        // @ts-expect-error I expect browser to always return list with coords
        const x = event.targetTouches[0].clientX;
        setTouchStart(x);
        setTouchEnd(x);
    }

    function handleTouchMove(event: TouchEvent<HTMLImageElement>) {
        // @ts-expect-error I expect browser to always return list with coords
        setTouchEnd(event.targetTouches[0].clientX);
    }

    function handleTouchEnd() {
        const swipedToTheRight = touchStart - touchEnd > SWIPE_TRESHOLD;
        if (swipedToTheRight) {
            moveToNextImage();
            return;
        }

        const swipedToTheLeft = touchStart - touchEnd < -SWIPE_TRESHOLD;
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
                className="absolute top-[15px] right-[15px] bg-black bg-opacity-50 p-2 rounded-3xl"
                onClick={closeInspection}
            >
                <CircleX />
            </button>
            <button
                type="button"
                className="absolute left-[20px] top-1/2 select-none bg-black bg-opacity-50 p-2 rounded-3xl"
                onClick={moveToNextImage}
            >
                <CircleArrowLeft />
            </button>
            <button
                type="button"
                className="absolute right-[20px] top-1/2 select-none bg-black bg-opacity-50 p-2 rounded-3xl"
                onClick={moveToPrevImage}
            >
                <CircleArrowRight />
            </button>
            <a href={inspectedImage.fullSizeSrc} download={inspectedImage.filename}>
                <button
                    type="button"
                    className="absolute bottom-[15px] right-[15px] bg-black bg-opacity-50 p-2 rounded-md"
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
