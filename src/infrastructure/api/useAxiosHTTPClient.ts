import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HTTPRequest, HTTPResponse, HTTPService } from '@domain/ports/out/api/HTTPService';
import { useCallback, useRef } from 'react';
import { merge } from 'lodash'

export const useAxiosHTTPClient = (config?: Partial<HTTPRequest<any>>): HTTPService => {
    const httpConfigRef = useRef(mapToAxiosConfig(config || {}));
    const axiosInstanceRef = useRef<AxiosInstance>(axios.create(httpConfigRef.current));

    const setConfig = useCallback((config: Partial<HTTPRequest<any>>) => {
        httpConfigRef.current = mapToAxiosConfig(merge(httpConfigRef.current, config));
        axiosInstanceRef.current = axios.create(httpConfigRef.current);
    }, []);

    const request = useCallback(async <T>(config: HTTPRequest<T>): Promise<HTTPResponse<T>> => {
        const axiosConfig = mapToAxiosConfig(merge(httpConfigRef.current, config));

        try {
            const response: AxiosResponse<T> = await axiosInstanceRef.current(axiosConfig);

            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
                headers: convertHeaders(response.headers),
                config,
                request: response.request,
            };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw {
                    data: error.response.data,
                    status: error.response.status,
                    statusText: error.response.statusText,
                    headers: convertHeaders(error.response.headers),
                    config,
                    request: error.request,
                };
            } else {
                console.error('useAxiosHTTPClient Error:', error);
                throw {
                    type: 'UnexpectedError',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    originalError: error,
                };
            }
        }
    }, []);

    return {
        setConfig,
        request,
    };
};

function mapToAxiosConfig<T>(config: Partial<HTTPRequest<T>>): AxiosRequestConfig {
    return {
        baseURL: config.baseURL || undefined,
        method: config.method || 'GET',
        url: config.url,
        headers: config.headers,
        data: config.body,
        params: config.query || config.params,
        responseType: config.responseType || 'json',
        timeout: config.timeout,
        withCredentials: config.withCredentials,
        transformRequest: config.transformRequest,
        transformResponse: config.transformResponse,
    };
}

function convertHeaders(headers: any): Record<string, string> {
    const result: Record<string, string> = {};
    if (headers) {
        Object.keys(headers).forEach((key) => {
            result[key] = headers[key] as string;
        });
    }
    return result;
}
