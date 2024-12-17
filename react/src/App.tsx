import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { HeritageProvider } from "./providers/HeritageProvider";
import { Layout } from "./components/views/Layout";
import { RoutePaths } from "./constants/RoutePaths";
import { Contact } from "./pages/Contact";
import { Rodo } from "./pages/Rodo";
import { SupportMe } from "./pages/SupportMe";
import { AboutMe } from "./pages/AboutMe";
import { NoMatch } from "./pages/NoMatch";
import { AuthProvider } from "./providers/AuthProvider";
import { LoadingPage } from "./pages/LoadingPage";
import { GlobalError } from "./pages/GlobalError/GlobalError";

const LazyHome = lazy(() => import("./pages/Home"));
const LazyPeople = lazy(() => import("./pages/People"));
const LazyBranch = lazy(() => import("./pages/Branches"));
const LazyPerson = lazy(() => import("./pages/Person"));

const router = createBrowserRouter([
    {
        path: RoutePaths.ROOT,
        element: <Layout />,
        errorElement: <GlobalError />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <LazyHome />
                    </Suspense>
                ),
            },
            {
                path: RoutePaths.OSOBY,
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <LazyPeople />
                    </Suspense>
                ),
            },
            {
                path: `${RoutePaths.OSOBY}/:id`,
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <LazyPerson />
                    </Suspense>
                ),
            },
            {
                path: RoutePaths.GAŁĘZIE,
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <LazyBranch />
                    </Suspense>
                ),
            },
            {
                path: RoutePaths.KONTAKT,
                element: <Contact />,
            },
            {
                path: RoutePaths.RODO,
                element: <Rodo />,
            },
            {
                path: RoutePaths.WSPARCIE,
                element: <SupportMe />,
            },
            {
                path: RoutePaths.O_MNIE,
                element: <AboutMe />,
            },
        ],
    },
    {
        path: RoutePaths.MATCH_ALL,
        element: <NoMatch />,
    },
]);

export function App() {
    return (
        <AuthProvider>
            <HeritageProvider>
                <RouterProvider router={router} />
            </HeritageProvider>
        </AuthProvider>
    );
}
