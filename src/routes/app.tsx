import { Navigate, Outlet } from "react-router";
import { PublicRoute } from "./routeGuards";
import Home from "@pages/Home/Home";

const home = {
    path: "home",
    element: <Home />
}


export default [{
    path: "app",
    element: <>
        <PublicRoute
            component={<Outlet />}
        />
    </>,
    children: [
        {
            path: "",
            element: <Navigate to={"/app/home"} replace />
        },
        home,
    ],
}]
