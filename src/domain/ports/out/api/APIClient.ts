import { HTTPService, HTTPRequest, HTTPResponse } from "../api/HTTPService";

export abstract class APIClient {
    protected httpService: HTTPService;

    constructor (httpService: HTTPService) {
        this.httpService = httpService;
    }

    /**
     * Define el baseURL para las solicitudes de esta API.
     * Las subclases pueden sobrescribir este valor.
     */
    protected get baseURL(): string {
        return '';
    }

    /**
     * Realiza una solicitud GET.
     * @param url Endpoint relativo.
     * @param params Parámetros de consulta.
     * @returns Respuesta de la solicitud.
     */
    async get<T>(url: string, params?: Record<string, string>): Promise<HTTPResponse<T>> {
        return this.request<T>({
            method: 'GET',
            url: this.resolveURL(url),
            params,
        });
    }

    /**
     * Realiza una solicitud POST.
     * @param url Endpoint relativo.
     * @param body Cuerpo de la solicitud.
     * @returns Respuesta de la solicitud.
     */
    async post<T>(url: string, body?: any): Promise<HTTPResponse<T>> {
        return this.request<T>({
            method: 'POST',
            url: this.resolveURL(url),
            body,
        });
    }

    /**
     * Realiza una solicitud PUT.
     * @param url Endpoint relativo.
     * @param body Cuerpo de la solicitud.
     * @returns Respuesta de la solicitud.
     */
    async put<T>(url: string, body?: any): Promise<HTTPResponse<T>> {
        return this.request<T>({
            method: 'PUT',
            url: this.resolveURL(url),
            body,
        });
    }

    /**
     * Realiza una solicitud DELETE.
     * @param url Endpoint relativo.
     * @returns Respuesta de la solicitud.
     */
    async delete<T>(url: string): Promise<HTTPResponse<T>> {
        return this.request<T>({
            method: 'DELETE',
            url: this.resolveURL(url),
        });
    }

    /**
     * Método base para realizar una solicitud.
     * @param request Configuración de la solicitud.
     * @returns Respuesta de la solicitud.
     */
    protected async request<T>(config: Partial<HTTPRequest<T>>): Promise<HTTPResponse<T>> {
        try {
            return await this.httpService.request<T>({
                ...config,
                method: config.method || 'GET',
                url: config.url || '',
            });
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Resuelve la URL completa usando el baseURL.
     * @param endpoint Endpoint relativo.
     * @returns URL completa.
     */
    protected resolveURL(endpoint: string): string {
        return `${this.baseURL}${endpoint}`;
    }

    /**
     * Maneja errores de solicitudes.
     * Puede ser sobrescrito por las subclases para un manejo personalizado.
     * @param error Error de la solicitud.
     */
    protected handleError(error: any): void {
        console.error('API Error:', error);
    }
}
