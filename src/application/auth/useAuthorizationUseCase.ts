import jwt from 'jsonwebtoken';
import { useState, useCallback, useEffect } from 'react';
import { AuthorizationServicePort } from "@domain/ports/out/api/AuthorizationServicePort";
import { PreferencesStoragePort } from "@domain/ports/out/app/PreferencesStoragePort";
import { IJwt } from '@domain/models/entities/IJwt';
import { IJwtDecode } from '@domain/models/entities/IJwtDecode';
import { FlowType, IAuthorizationPort } from '@domain/ports/in/IAuthorizationPort';

export const useAuthorizationUseCase = (api: AuthorizationServicePort, storage: PreferencesStoragePort): IAuthorizationPort => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [token, setToken] = useState<string>();
    const [tokenDecoded, setTokenDecode] = useState<IJwtDecode>();

    useEffect(() => {
        getToken()
    }, [storage])

    // Actualizar token y tokenDecode
    useEffect(() => {
        if (token) {
            setTokenDecode(decodeToken(token))
            setIsAuthenticated(true);
            setIsReady(true)
            saveToken(token)
        } else if (isReady) {
            setIsAuthenticated(false);
            setTokenDecode(undefined)
            removeToken()
        }

    }, [token])

    const decodeToken = (token: string) => {
        return jwt.decode(token) as IJwtDecode
    }

    const getToken = async () => {
        const currentToken = await storage.get('@token')
        if (currentToken) {
            setToken(currentToken)
            return
        }
        setIsReady(true)
    }

    const saveToken = async (token: string) => {
        if (token) {
            await storage.set('@token', token)
        }
    }
    const removeToken = async () => {
        await storage.remove('@token')
    }

    const register = useCallback(async (flow: FlowType, param?: any) => {
        switch (flow) {
            case 'INVITE':
                return await (async () => {
                    setIsAuthenticated(false)
                    const response: IJwt = await api.registerInvite()
                    setToken(response.access_token)
                    return response
                })()
            case 'EMAIL':
                return await (async () => {
                    setIsAuthenticated(false)
                    const email = param
                    const response = await api.registerEmail(email)
                    return response
                })()
            default:
                setIsAuthenticated(false)
                setToken(undefined)
                return
        }
    }, [api])

    const checkCode = useCallback(async (code: string, email: string) => {
        setIsAuthenticated(false)
        const response: IJwt = await api.checkCode(code, email)
        setToken(response.access_token)
    }, [api])

    const login = useCallback(async (user: string, pass: string) => {
        const response = await api.login(user, pass);

        if (response.status === 200) {
            const body = response.body;
            setIsAuthenticated(true);
            return
        }
        setIsAuthenticated(false);
    }, [api]);

    const logout = useCallback(async () => {
        try {
            // await api.logout();
            setToken(undefined)
        } catch (e) { }
    }, [api])

    return {
        register,
        checkCode,
        login,
        logout,
        isAuthenticated,
        isReady,
        tokenDecoded,
        token
    };
};
