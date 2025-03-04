import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { DeviceModeProvider } from "./providers/DeviceModeProvider";
import { HeritageProvider } from "./providers/HeritageProvider";
import { Layout } from "./components/views/Layout";
import { RouterPath } from "./constants/routePaths";
import { NoMatch } from "./pages/NoMatch";
import { AuthProvider } from "./providers/AuthProvider";
import { LoadingPage } from "./pages/LoadingPage";
import { GlobalError } from "./pages/GlobalError/GlobalError";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

const LazyHome = lazy(() => import("./pages/Home"));
const LazyPeople = lazy(() => import("./pages/People"));
const LazyBranch = lazy(() => import("./pages/Branches"));
const LazyPerson = lazy(() => import("./pages/Person"));
const LazyContact = lazy(() => import("./pages/Contact"));
const LazyRodo = lazy(() => import("./pages/Rodo"));
const LazySupport = lazy(() => import("./pages/SupportMe"));
const LazyAboutMe = lazy(() => import("./pages/AboutMe"));

const router = createBrowserRouter([
    {
        path: RouterPath.ROOT,
        element: <Layout />,
        errorElement: <GlobalError />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <ProtectedRoute>
                            <LazyHome />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: RouterPath.OSOBY,
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <ProtectedRoute>
                            <LazyPeople />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: `${RouterPath.OSOBY}/:id`,
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <ProtectedRoute>
                            <LazyPerson />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: RouterPath.GAŁĘZIE,
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <ProtectedRoute>
                            <LazyBranch />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: RouterPath.KONTAKT,
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <ProtectedRoute>
                            <LazyContact />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: RouterPath.RODO,
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <ProtectedRoute>
                            <LazyRodo />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: RouterPath.WSPARCIE,
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <ProtectedRoute>
                            <LazySupport />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: RouterPath.O_MNIE,
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <ProtectedRoute>
                            <LazyAboutMe />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
        ],
    },
    {
        path: "/testpage",
        element: <div className="h-full flex flex-col justify-center">Test</div>,
    },
    {
        path: RouterPath.LOGOWANIE,
        element: <LoginPage />,
    },
    {
        path: RouterPath.MATCH_ALL,
        element: <NoMatch />,
    },
]);

export function App() {
    return (
        <DeviceModeProvider>
            <AuthProvider>
                <HeritageProvider>
                    <RouterProvider router={router} />
                </HeritageProvider>
            </AuthProvider>
        </DeviceModeProvider>
    );
}
