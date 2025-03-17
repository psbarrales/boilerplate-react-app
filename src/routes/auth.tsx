import { Navigate } from "react-router";
import { PublicUnAuthorizedRoute } from "./routeGuards";

export default [
    {
        path: "auth",
        element: <PublicUnAuthorizedRoute />,
        children: [
            {
                path: "",
                element: <Navigate to={"/auth/login"} replace />
            },
            {
                path: "login",
                element: <Navigate to={"/app/home"} replace />,
            }
        ],
    }
]
