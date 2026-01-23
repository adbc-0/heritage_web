import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { DeviceModeProvider } from "./features/deviceMode/DeviceModeProvider";
import { HeritageProvider } from "@/features/heritageData/HeritageProvider";
import { AuthProvider } from "./features/auth/AuthProvider";
import { Layout } from "./components/views/Layout";
import { RouterPath } from "./constants/routePaths";
import { NoMatch } from "./pages/NoMatch";
import { GlobalError } from "./pages/GlobalError/GlobalError";
import { Loader } from "./components/ui/Loader/Loader";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";

const LazyHome = lazy(() => import("./pages/Home"));
const LazyPeople = lazy(() => import("./pages/People"));
const LazyPerson = lazy(() => import("./pages/Person"));
const LazyContact = lazy(() => import("./pages/Contact"));
const LazyRodo = lazy(() => import("./pages/Rodo"));
const LazySupport = lazy(() => import("./pages/SupportMe"));
const LazyAboutMe = lazy(() => import("./pages/AboutMe"));

// consider using tanstack router or using native lazy loading from react router
const router = createBrowserRouter([
    {
        path: RouterPath.ROOT,
        element: <Layout />,
        errorElement: <GlobalError />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<Loader />}>
                        <ProtectedRoute>
                            <LazyHome />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: RouterPath.OSOBY,
                element: (
                    <Suspense fallback={<Loader />}>
                        <ProtectedRoute>
                            <LazyPeople />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: `${RouterPath.OSOBY}/:id`,
                element: (
                    <Suspense fallback={<Loader />}>
                        <ProtectedRoute>
                            <LazyPerson />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: RouterPath.KONTAKT,
                element: (
                    <Suspense fallback={<Loader />}>
                        <ProtectedRoute>
                            <LazyContact />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: RouterPath.RODO,
                element: (
                    <Suspense fallback={<Loader />}>
                        <ProtectedRoute>
                            <LazyRodo />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: RouterPath.WSPARCIE,
                element: (
                    <Suspense fallback={<Loader />}>
                        <ProtectedRoute>
                            <LazySupport />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
            {
                path: RouterPath.O_MNIE,
                element: (
                    <Suspense fallback={<Loader />}>
                        <ProtectedRoute>
                            <LazyAboutMe />
                        </ProtectedRoute>
                    </Suspense>
                ),
            },
        ],
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
