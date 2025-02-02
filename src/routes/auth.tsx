import { Navigate } from "react-router";
import { ProtectedRouteByRoles, PublicUnAuthorizedRoute } from "./routeGuards";
import Login from "@presentation/pages/Register/Login";
import Email from "@presentation/pages/Register/Email";
import OTP from "@presentation/pages/Register/OTP";

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
                element: <Login />,
            },
            {
                path: "email",
                element: <Email />,
            },
            {
                path: "otp",
                element: <OTP />,
            },
        ],
    },
    {
        path: "auth/register",
        element: <ProtectedRouteByRoles
            roles={['INVITED']}
            component={<Login />}
            notRoleComponent={<Navigate to={"/auth/login"} replace />}
        />,
    },
]
