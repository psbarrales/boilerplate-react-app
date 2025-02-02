export interface HTTPRequest<T> {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
    url?: string;
    baseURL?: string;
    headers?: Record<string, string>;
    body?: any;
    params?: Record<string, any>;
    query?: Record<string, string>;
    responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
    timeout?: number;
    withCredentials?: boolean;
    transformRequest?: (data: any) => any;
    transformResponse?: (data: any) => T;
}

export interface HTTPResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: HTTPRequest<T>;
    request?: any;
}

export interface HTTPService {
    /**
     * Realiza una solicitud HTTP genérica.
     * @param config Configuración de la solicitud HTTP.
     * @returns Una promesa que se resuelve con una respuesta HTTP.
     */
    request<T>(config: HTTPRequest<T>): Promise<HTTPResponse<T>>;

    /**
     * Permite actualizar la configuración de la instancia de HTTPService.
     * @param config Configuración parcial que se aplicará.
     */
    setConfig(config: HTTPRequest<any>): void;
}
