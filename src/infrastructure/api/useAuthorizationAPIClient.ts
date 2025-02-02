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

    const registerInvite = useCallback(async () => {
        const response = await httpServiceRef.current.request({
            url: '/register/invite',
            responseType: 'json',
        })
        return response.data as IJwt
    }, [httpService])

    const registerEmail = useCallback(async (email: string) => {
        const response = await httpServiceRef.current.request({
            method: 'POST',
            url: '/register',
            responseType: 'json',
            body: { "full_name": "", "phone": "", "email": email, "code": "" }
        })
        return response.data
    }, [httpService])

    const checkCode = useCallback(async (code: string, email: string): Promise<IJwt> => {
        const response = await httpServiceRef.current.request({
            method: 'POST',
            url: '/register/check-code',
            responseType: 'json',
            body: { "email": email, "full_name": "-", "phone": "", "code": code }
        })
        return response.data as IJwt
    }, [httpService])
    /**
     * Inicia sesión con las credenciales proporcionadas.
     * @param user Nombre de usuario o email.
     * @param pass Contraseña.
     * @returns Una promesa que se resuelve con los datos de la sesión.
     */
    const login = useCallback(async (user: string, pass: string): Promise<IJwt> => {
        const response = await httpServiceRef.current.request({
            method: 'POST',
            url: '/auth/login',
            body: { user, pass },
            responseType: 'json',
        });
        return response.data as IJwt;
    }, []);

    /**
     * Cierra sesión.
     * @returns Una promesa que se resuelve al completar la operación.
     */
    const logout = useCallback(async (): Promise<void> => {
        await httpServiceRef.current.request({
            method: 'POST',
            url: '/auth/logout',
            responseType: 'json',
        });
    }, []);

    return { registerInvite, registerEmail, checkCode, login, logout };
};
