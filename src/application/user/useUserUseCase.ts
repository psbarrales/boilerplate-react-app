import { useCallback, useEffect, useState } from "react";
import { IUser, IUserRole } from "@domain/models/entities/IUser";
import { PreferencesStoragePort } from "@domain/ports/out/app/PreferencesStoragePort";
import { UserServicePort } from "@domain/ports/out/api/UserServicePort";
import { IAuthorizationPort } from "@domain/ports/in/IAuthorizationPort";
import { IUserPort } from "@domain/ports/in/IUserPort";

export const useUserUseCase =
    (api: UserServicePort, auth: IAuthorizationPort):
        IUserPort => {
        const [user, setUser] = useState<IUser>()
        const [role, setRole] = useState<IUserRole>()

        useEffect(() => {
            if (!auth.isAuthenticated || !auth.tokenDecoded) return clear()
            const tokenDecoded = auth.tokenDecoded
            setRole(getRoleFrom(tokenDecoded.scope, tokenDecoded.email))
        }, [auth.isAuthenticated, auth.tokenDecoded])

        useEffect(() => {
            if (role && role === 'USER' && !user) {
                me()
            }
        }, [role, user])

        const getRoleFrom = (scope: string, email: string): IUserRole => {
            if (email.toLowerCase() === 'invited') {
                return 'INVITED';
            }
            if (scope.includes('user')) {
                return 'USER';
            }
            if (scope.includes(':admin')) {
                return 'ADMIN';
            }
            return 'INVALID';
        };

        const clear = useCallback(() => {
            setRole(undefined);
            setUser(undefined);
        }, []);

        const me = useCallback(async () => {
            try {
                if (!auth.isAuthenticated) return
                const userInfo = await api.me()
                setUser(userInfo)
            } catch (err) {
                if ((err as any).status === 401) {
                    auth.logout()
                }
            }
        }, [api, auth.isAuthenticated])

        return {
            user,
            role,
            me
        }
    }
