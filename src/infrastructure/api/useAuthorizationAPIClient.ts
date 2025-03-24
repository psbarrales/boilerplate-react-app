import { useCallback, useEffect, useRef } from 'react';
import { HTTPService } from '@domain/ports/out/api/HTTPService';
import { AuthorizationServicePort } from '@domain/ports/out/api/AuthorizationServicePort';
import { IJwt } from '@domain/models/entities/IJwt';

export const useAuthorizationAPIClient = (httpService: HTTPService): AuthorizationServicePort => {
    const httpServiceRef = useRef(httpService);

    useEffect(() => {
        httpServiceRef.current.setConfig({
            baseURL: import.meta.env.VITE_API_ENDPOINT,
        });
    }, []);

    const login = useCallback(async (user: string, pass: string): Promise<IJwt> => {
        const response = await httpServiceRef.current.request({
            method: 'POST',
            url: '/auth/login',
            body: { user, pass },
            responseType: 'json',
        });
        return response.data as IJwt;
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        await httpServiceRef.current.request({
            method: 'POST',
            url: '/auth/logout',
            responseType: 'json',
        });
    }, []);

    return { login, logout };
};
