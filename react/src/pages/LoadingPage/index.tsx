import { Loader } from "lucide-react";

export function LoadingPage() {
    return (
        <div className="h-screen flex items-center justify-center">
            <Loader size={40} className="animate-spin" />
        </div>
    );
}
