import { useCallback, useEffect, useRef } from 'react';
import { HTTPService } from '@domain/ports/out/api/HTTPService';
import { UserServicePort } from '@domain/ports/out/api/UserServicePort';
import { IUser } from '@domain/models/entities/IUser';

export const useUserAPIClient = (httpService: HTTPService): UserServicePort => {
    const httpServiceRef = useRef(httpService);

    useEffect(() => {
        httpServiceRef.current.setConfig({
            baseURL: import.meta.env.VITE_API_ENDPOINT,
        });
    }, []);

    // Existing endpoints
    const me = useCallback(async () => {
        const response = await httpServiceRef.current.request({
            url: '/users/me/info',
            responseType: 'json',
        });
        return response.data as IUser;
    }, [httpServiceRef]);

    return {
        me
    };
};
