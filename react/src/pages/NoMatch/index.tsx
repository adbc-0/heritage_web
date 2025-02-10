import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { RouterPath } from "@/constants/routePaths";

export function NoMatch() {
    return (
        <div className="text-center content-center h-full">
            <h1 className="text-9xl font-bold tracking-tight mt-2">404</h1>
            <h1 className="text-4xl font-bold tracking-tight mt-2">Page not found</h1>
            <Link to={RouterPath.ROOT}>
                <Button className="mt-6 cursor-pointer active:scale-95 transition-transform">
                    Go back home
                </Button>
            </Link>
        </div>
    );
}
