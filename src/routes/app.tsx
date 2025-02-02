import { Navigate, Outlet } from "react-router";
import { ProtectedRouteByRoles } from "./routeGuards";
import Home from "@presentation/pages/Home/Home";
import Dashboard from "@presentation/pages/Home/Dashboard";
import Items from "@presentation/pages/Home/Items";

const home = {
    path: "home",
    element: <Home />,
    children: [
        {
            path: "",
            element: <Navigate to={"/app/home/dashboard"} replace />
        },
        {
            path: "dashboard",
            element: <Dashboard />,
        },
        {
            path: "items",
            element: <Items />,
        },
    ]
}


export default [{
    path: "app",
    element: <>
        <ProtectedRouteByRoles
            roles={['USER', 'INVITED']}
            component={<Outlet />}
        />
    </>,
    children: [
        {
            path: "",
            element: <Navigate to={"/app/home/dashboard"} replace />
        },
        home,
    ],
}]
