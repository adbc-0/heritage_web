import { ServerOff } from "lucide-react";

export function NoServerConnection() {
    return (
        <div className="h-screen flex items-center justify-center">
            <div>
                <ServerOff className="m-auto" size={40} />
                <h1 className="text-2xl font-bold tracking-tight mt-2">No server connection</h1>
            </div>
        </div>
    );
}
