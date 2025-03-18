import {
    createBrowserRouter,
    Navigate,
} from "react-router-dom";
import NotFound from "@pages/NotFound";
import { PublicRoute } from "@routes/routeGuards";
import auth from "./auth";
import app from "./app";
import NotImplemented from "@pages/NotImplemented";
import VersionUpdatePrompt from "@pages/VersionUpdatePrompt";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <PublicRoute />,
        errorElement: <NotFound />,
        children: [
            {
                path: "",
                element: <PublicRoute component={<Navigate to={"/auth/login"} replace />} />
            },
            {
                path: "update",
                element: <VersionUpdatePrompt />
            },
            {
                path: "debug",
                element: <NotImplemented />
            },
            ...auth,
            ...app
        ]
    },
]);

export default router
