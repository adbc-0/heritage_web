export function NoServerConnection() {
    return (
        <div className="min-h-[100dvh] flex items-center justify-center">
            <div>
                <span className="material-symbols-outlined m-auto" style={{ fontSize: 40 }}>
                    cloud_off
                </span>
                <h1 className="text-2xl font-bold tracking-tight mt-2">No server connection</h1>
            </div>
        </div>
    );
}
