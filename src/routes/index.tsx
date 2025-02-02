import {
    createBrowserRouter,
    Navigate,
} from "react-router-dom";
import NotFound from "@presentation/pages/NotFound";
import { PublicRoute } from "@routes/routeGuards";
import auth from "./auth";
import app from "./app";

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
                path: "debug",
                element: <div>Debug Page</div>
            },
            ...auth,
            ...app
        ]
    },
]);

export default router
