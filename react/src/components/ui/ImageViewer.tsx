import {
    ComponentRef,
    createContext,
    ReactElement,
    Ref,
    TouchEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { CircleArrowLeft, CircleArrowRight, CircleX } from "lucide-react";

import { ENV } from "@/constants/env";

type ReactChildren = {
    children: ReactElement | ReactElement[];
};

type ViewerContextType = {
    allImageUrls: string[];
    openedImage: string | null;
    openPreview: (imageUrl: string) => void;
    closePreview: () => void;
    moveToNextImage: () => void;
    moveToPrevImage: () => void;
};

const ViewerContext = createContext<ViewerContextType>({
    allImageUrls: [],
    openedImage: null,
    moveToNextImage: () => {
        throw new Error("unimplmeneted");
    },
    moveToPrevImage: () => {
        throw new Error("unimplmeneted");
    },
    openPreview: () => {
        throw new Error("unimplmeneted");
    },
    closePreview: () => {
        throw new Error("unimplmeneted");
    },
});

function usePreviewContext() {
    return useContext(ViewerContext);
}

// ToDo: Remove hardcoded url for image fetching
type ImagePreviewType = {
    ref: Ref<HTMLDialogElement>;
    personId: string;
};
function ImagePreview({ ref, personId }: ImagePreviewType) {
    const { openedImage, moveToNextImage, moveToPrevImage, closePreview } = usePreviewContext();

    const [, setZoomedIn] = useState(false);
    // ToDo: Improve swiping to not rerender website on coord change. Use ref instead.
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    function handleTouchStart(event: TouchEvent<HTMLImageElement>) {
        // @ts-expect-error I expect browser to always return list with coords
        setTouchStart(event.targetTouches[0].clientX);
    }

    function handleTouchMove(event: TouchEvent<HTMLImageElement>) {
        // @ts-expect-error I expect browser to always return list with coords
        setTouchEnd(event.targetTouches[0].clientX);
    }

    function handleTouchEnd() {
        if (touchStart - touchEnd > 100) {
            moveToNextImage();
        }

        if (touchStart - touchEnd < -100) {
            moveToPrevImage();
        }
    }

    const toggleZoomIn = () => {
        setZoomedIn((currentState) => !currentState);
    };

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

    // ToDo: dialog element can wrap ImagePreview instead
    return (
        <dialog
            ref={ref}
            className="bg-zinc-800 backdrop:bg-black backdrop:bg-opacity-55 h-full w-full rounded-lg"
        >
            {openedImage ? (
                <>
                    <span className="absolute bottom-0 m-auto left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-md">
                        {openedImage}
                    </span>
                    <button
                        type="button"
                        className="absolute top-[15px] right-[15px] bg-black bg-opacity-50 p-2 rounded-3xl"
                        onClick={closePreview}
                    >
                        <CircleX />
                    </button>
                    <button
                        type="button"
                        className="absolute left-[20px] top-1/2 select-none bg-black bg-opacity-50 p-2 rounded-3xl"
                        onClick={moveToPrevImage}
                    >
                        <CircleArrowLeft />
                    </button>
                    <button
                        type="button"
                        className="absolute right-[20px] top-1/2 select-none bg-black bg-opacity-50 p-2 rounded-3xl"
                        onClick={moveToNextImage}
                    >
                        <CircleArrowRight />
                    </button>
                    <img
                        src={`${ENV.API_URL}/public/${personId}/photos/${openedImage}`}
                        alt={openedImage}
                        className="w-full h-full object-contain"
                        aria-hidden
                        onClick={toggleZoomIn}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    />
                </>
            ) : null}
            {/* <div className="flex flex-col h-full">
                <div>File name</div>
                <img
                    src={`${ENV.API_URL}/public/I70/photos/${openedImage}`}
                    alt={openedImage}
                    className="h-1 flex-grow object-contain"
                />
                <div>Actions</div>
            </div> */}
        </dialog>
    );
}

type ImageViewerType = ReactChildren & {
    allImages: string[];
    personId: string;
};
export function ImageViewer({ children, allImages, personId }: ImageViewerType) {
    const dialogRef = useRef<ComponentRef<"dialog">>(null);
    const [openedImage, setOpenedImage] = useState<string | null>(null);

    const openPreview = useCallback((imageUrl: string) => {
        if (!dialogRef.current) {
            throw new Error("dialog ref was not set properly");
        }
        setOpenedImage(imageUrl);
        dialogRef.current.showModal();
    }, []);
    const closePreview = useCallback(() => {
        if (!dialogRef.current) {
            throw new Error("dialog ref was not set properly");
        }
        dialogRef.current.close();
        setOpenedImage(null);
    }, []);
    const moveToNextImage = useCallback(() => {
        const currentImageIndex = allImages.findIndex((image) => openedImage === image);

        const imageIndexNotFound = currentImageIndex === -1;
        if (imageIndexNotFound) {
            throw new Error("could not find image");
        }

        const lastImageOnList = currentImageIndex === allImages.length - 1;
        if (lastImageOnList) {
            const firstImage = allImages.at(0);
            if (!firstImage) {
                throw new Error("no image");
            }
            setOpenedImage(firstImage);
            return;
        }

        const nextImage = allImages.at(currentImageIndex + 1);
        if (!nextImage) {
            throw new Error("no image");
        }

        setOpenedImage(nextImage);
    }, [allImages, openedImage]);
    const moveToPrevImage = useCallback(() => {
        const currentImageIndex = allImages.findIndex((image) => openedImage === image);
        const imageIndexNotFound = currentImageIndex === -1;
        if (imageIndexNotFound) {
            throw new Error("could not find image");
        }

        const firstImageOnList = currentImageIndex === allImages.length;
        if (firstImageOnList) {
            const lastImage = allImages.at(-1);
            if (!lastImage) {
                throw new Error("empty image list");
            }
            setOpenedImage(lastImage);
            return;
        }

        const prevImage = allImages.at(currentImageIndex - 1);
        if (!prevImage) {
            throw new Error("no image");
        }

        setOpenedImage(prevImage);
    }, [allImages, openedImage]);

    const provider: ViewerContextType = useMemo(
        () => ({
            allImageUrls: allImages,
            openedImage,
            openPreview,
            closePreview,
            moveToNextImage,
            moveToPrevImage,
        }),
        [allImages, openedImage, closePreview, moveToNextImage, openPreview, moveToPrevImage],
    );

    return (
        <ViewerContext.Provider value={provider}>
            <ImagePreview ref={dialogRef} personId={personId} />
            {children}
        </ViewerContext.Provider>
    );
}

type ImageThumbnailType = ReactChildren & {
    className: string;
    originalResolutionImageUrl: string;
};
export function ImageThumbnail({
    children,
    className,
    originalResolutionImageUrl,
}: ImageThumbnailType) {
    const { openPreview } = usePreviewContext();
    return (
        <button
            type="button"
            className={className}
            onClick={() => {
                openPreview(originalResolutionImageUrl);
            }}
        >
            {children}
        </button>
    );
}
