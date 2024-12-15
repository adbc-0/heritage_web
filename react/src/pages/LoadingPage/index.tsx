import { Loader } from "lucide-react";

export function LoadingPage() {
    return (
        <div className="relative h-full w-full">
            <div className="absolute top-0 left-0 h-full w-full">
                <div className="h-full flex items-center justify-center">
                    <Loader size={40} className="animate-spin" />
                </div>
            </div>
        </div>
    );
}
