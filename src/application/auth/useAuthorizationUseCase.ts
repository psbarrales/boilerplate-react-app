import jwt from 'jsonwebtoken';
import { useState, useCallback, useEffect } from 'react';
import { AuthorizationServicePort } from "@domain/ports/out/api/AuthorizationServicePort";
import { PreferencesStoragePort } from "@domain/ports/out/app/PreferencesStoragePort";
import { IJwt } from '@domain/models/entities/IJwt';
import { IJwtDecode } from '@domain/models/entities/IJwtDecode';
import { IAuthorizationPort } from '@domain/ports/in/IAuthorizationPort';

export const useAuthorizationUseCase = (api: AuthorizationServicePort, storage: PreferencesStoragePort): IAuthorizationPort => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [token, setToken] = useState<string>();
    const [tokenDecoded, setTokenDecode] = useState<IJwtDecode>();

    useEffect(() => {
        getToken()
    }, [storage])

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

    const login = useCallback(async (user: string, pass: string) => {
        try {
            const response: IJwt = await api.login(user, pass);
            setToken(response.access_token);
        } catch (error) {
            setToken(undefined);
            throw error;
        }
    }, [api]);

    const logout = useCallback(async () => {
        try {
            await api.logout();
        } finally {
            setToken(undefined);
        }
    }, [api]);

    return {
        login,
        logout,
        isAuthenticated,
        isReady,
        token,
        tokenDecoded
    };
};
