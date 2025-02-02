import { HTTPRequest, HTTPResponse, HTTPService } from '@domain/ports/out/api/HTTPService';
import { useCallback, useRef } from 'react';
import { merge } from 'lodash';

export const useFetchHTTPClient = (config?: Partial<HTTPRequest<any>>): HTTPService => {
    const httpConfigRef = useRef(mapToFetchConfig(config || {}));

    const setConfig = useCallback((config: Partial<HTTPRequest<any>>) => {
        httpConfigRef.current = mapToFetchConfig(merge(httpConfigRef.current, config));
    }, []);

    const request = useCallback(async <T>(config: HTTPRequest<T>): Promise<HTTPResponse<T>> => {
        const mergedConfig = merge(httpConfigRef.current, config);
        const fetchConfig = mapToFetchConfig(mergedConfig);

        try {
            const response = await fetch(fetchConfig.url!, fetchConfig);

            // Manejar estados de error
            if (!response.ok) {
                const errorData = await parseResponse(response, fetchConfig.responseType);
                throw {
                    response: {
                        data: errorData,
                        status: response.status,
                        statusText: response.statusText,
                        headers: convertHeaders(response.headers),
                    },
                    config: mergedConfig,
                    request: response,
                };
            }

            const responseData = await parseResponse(response, fetchConfig.responseType);

            return {
                data: responseData,
                status: response.status,
                statusText: response.statusText || '',
                headers: convertHeaders(response.headers),
                config: mergedConfig,
                request: response,
            };
        } catch (error) {
            console.error('useFetchHTTPClient Error:', error);
            throw error;
        }
    }, []);

    return {
        setConfig,
        request,
    };
};

function mapToFetchConfig<T>(config: Partial<HTTPRequest<T>>): RequestInit & { url?: string; responseType?: string } {
    const baseURL = config.baseURL || '';
    const fullUrl = config.url ? new URL(config.url, baseURL).toString() : undefined;

    // Configurar encabezados predeterminados
    const headers = config.headers || {};
    if (!headers['Content-Type'] && config.body) {
        headers['Content-Type'] = 'application/json';
    }

    return {
        url: fullUrl,
        method: config.method || 'GET',
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        responseType: config.responseType || 'json',
        credentials: config.withCredentials ? 'include' : 'same-origin',
    };
}

async function parseResponse(response: Response, responseType?: string): Promise<any> {
    try {
        if (responseType === 'json') {
            return response.json();
        } else if (responseType === 'text') {
            return response.text();
        } else if (responseType === 'blob') {
            return response.blob();
        } else if (responseType === 'arraybuffer') {
            return response.arrayBuffer();
        }
        return response.text(); // Default to text if responseType is not specified
    } catch (error) {
        console.error('Error parsing response:', error);
        throw error;
    }
}

function convertHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
        result[key] = value;
    });
    return result;
}
