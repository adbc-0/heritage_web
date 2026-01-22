import { Link } from "react-router";

import { RouterPath } from "@/constants/routePaths";

export function NoMatch() {
    return (
        <div>
            <h1>404</h1>
            <h1>Page not found</h1>
            <Link to={RouterPath.ROOT}>
                <button type="button">Go back home</button>
            </Link>
        </div>
    );
}
