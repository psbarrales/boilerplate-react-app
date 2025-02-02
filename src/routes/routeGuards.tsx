import { IUserRole } from "@domain/models/entities/IUser";
import { useAuth } from "@providers/AuthProvider";
import { useUser } from "@providers/UserProvider";
import React from "react";
import { Navigate, Outlet } from "react-router";

interface RouteProps {
    component?: React.FC<any> | JSX.Element;
}
interface ProtectedRouteByRoleProps {

    roles?: Array<IUserRole>;
    notRoleComponent?: React.FC<any> | JSX.Element;
}


const BuildComponent: React.FC<{ component?: React.ElementType | JSX.Element }> = ({ component }) => {
    if (React.isValidElement(component)) {
        // Si `component` es un elemento JSX
        return component;
    }

    if (typeof component === "function") {
        // Si `component` es un componente funcional
        const Component = component;
        return <Component />;
    }

    // Si no se proporciona componente, renderiza <Outlet />
    return <Outlet />;
};

export const PublicRoute: React.FC<RouteProps> = ({ component }) => {
    return <BuildComponent component={component} />;
};

export const PublicUnAuthorizedRoute = () => {
    const auth = useAuth()

    if (!auth.isReady) {
        return <div></div>;
    }

    if (auth.isAuthenticated) {
        return <Navigate to={"/app/home/dashboard"} replace />
    }
    return <Outlet />;
};


export const ProtectedRouteByRoles: React.FC<ProtectedRouteByRoleProps & RouteProps> = ({
    component: Component,
    roles = ['USER'],
    notRoleComponent: NotRoleComponent,
}) => {
    const auth = useAuth();
    const user = useUser();

    if (!auth.isReady) {
        return <div></div>;
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (!user.role) {
        return <div></div>;
    }

    if (!roles.includes(user.role)) {
        return (
            <BuildComponent
                component={
                    NotRoleComponent || (
                        <div>
                            <div>
                                <center>
                                    Rol "{user.role}" no tiene permiso para acceder:{" "}
                                    {JSON.stringify(roles)}
                                </center>
                            </div>
                        </div>
                    )
                }
            />
        );
    }

    return <BuildComponent component={Component} />;
};
