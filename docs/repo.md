## /Users/consultor/Development/boilerplate-app/src/application/auth/useAuthorizationUseCase.ts
```ts
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

```

## /Users/consultor/Development/boilerplate-app/src/application/user/useUserUseCase.ts
```ts
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

```

## /Users/consultor/Development/boilerplate-app/src/domain/models/entities/IUser.ts
```ts
export interface IUser {
    id: string;
    full_name: string;
    email: string;
    last_name?: string;
    avatar?: string;
    phone?: string;
    gender?: string;
    birthday?: Date;
    meta_data?: Record<string, any>;
    permissions?: Record<string, unknown>;
}

export type IUserRole = 'INVITED' | 'USER' | 'ADMIN' | 'INVALID'

```

## /Users/consultor/Development/boilerplate-app/src/domain/models/entities/IJwt.ts
```ts
export interface IJwt {
    access_token: string,
    expires_in: number,
    token_type: string
}

```

## /Users/consultor/Development/boilerplate-app/src/domain/models/entities/IJwtDecode.ts
```ts
export interface IJwtDecode {
    applicationid: string
    applicationname: string
    aud: string
    avatar: string
    country: string
    email: string
    exp: number
    groupsid: string
    iat: number
    iss: string
    primarysid: string
    scope: string
    type: string
    unique_name: string
}

```

## /Users/consultor/Development/boilerplate-app/src/domain/ports/out/app/RemoteConfigPort.ts
```ts
export interface RemoteConfigPort {
    getValue(key: string): string
    getBoolean(key: string, defaultValue?: boolean): boolean
    getNumber(key: string, defaultValue?: number): number
    getAll(): any
}

```

## /Users/consultor/Development/boilerplate-app/src/domain/ports/out/app/AppPort.ts
```ts
export interface AppPort {
    getInfo(): Promise<any>
    getState(): Promise<any>
    minimizeApp(): Promise<void>
    exitApp(): Promise<void>
}

```

## /Users/consultor/Development/boilerplate-app/src/domain/ports/out/app/PreferencesStoragePort.ts
```ts
export interface PreferencesStoragePort {
    get(key: string): Promise<any>
    remove(key: string): Promise<any>
    set(key: string, value: string): Promise<any>
}

```

## /Users/consultor/Development/boilerplate-app/src/domain/ports/out/api/AuthorizationServicePort.ts
```ts
import { IJwt } from "@domain/models/entities/IJwt"

export interface AuthorizationServicePort {
    registerInvite(): Promise<IJwt>
    registerEmail(email: string): Promise<any>
    checkCode(code: string, email: string): Promise<IJwt>
    login(user: string, pass: string): Promise<any>
    logout(): Promise<void>
}

```

## /Users/consultor/Development/boilerplate-app/src/domain/ports/out/api/HTTPService.ts
```ts
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

```

## /Users/consultor/Development/boilerplate-app/src/domain/ports/out/api/UserServicePort.ts
```ts
import { IUser } from "@domain/models/entities/IUser";

export interface UserServicePort {
    me(): Promise<IUser>;
}

```

## /Users/consultor/Development/boilerplate-app/src/domain/ports/out/api/APIClient.ts
```ts
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

```

## /Users/consultor/Development/boilerplate-app/src/domain/ports/out/device/PushNotificationsPort.ts
```ts
export interface PushNotificationsPort {
    checkPermissions(): Promise<boolean>
}

```

## /Users/consultor/Development/boilerplate-app/src/domain/ports/out/analytics/AnalyticsPort.ts
```ts
export interface AnalyticsPort {
    setUserId(userId: string): Promise<void>;
    setUserProperty(propertyName: string, value: string): Promise<void>;
    registerAction(action: string, view: string, params?: { [key: string]: string }): void;
    registerView(view: string, params?: { [key: string]: string }): void;
}

```

## /Users/consultor/Development/boilerplate-app/src/domain/ports/out/analytics/ErrorTrackingPort.ts
```ts
export interface ErrorTrackingPort {
    log(message: string): Promise<void>;
    recordError(message: string): Promise<void>;
    crash(message: string): Promise<void>
}

```

## /Users/consultor/Development/boilerplate-app/src/domain/ports/in/IAuthorizationPort.ts
```ts
import { IJwtDecode } from "@domain/models/entities/IJwtDecode";

export type FlowType = 'INVITE' | 'EMAIL' | 'GOOGLE' | 'APPLE';

export interface IAuthorizationPort {
    register: (flow: FlowType, param?: any) => Promise<any>
    checkCode: (code: string, email: string) => Promise<any>
    login: (user: string, pass: string) => Promise<void>;
    logout: () => Promise<void>
    isAuthenticated: boolean;
    isReady: boolean;
    token?: string;
    tokenDecoded?: IJwtDecode;
}

```

## /Users/consultor/Development/boilerplate-app/src/domain/ports/in/IUserPort.ts
```ts
import { IUser, IUserRole } from "@domain/models/entities/IUser";

export interface IUserPort {
    user?: IUser,
    role?: IUserRole,
    me(): any
}

```

## /Users/consultor/Development/boilerplate-app/src/infrastructure/capacitor/useAppAdapter.ts
```ts
// Mock implementation of the App object
const MockApp = {
    getInfo: async () => ({ name: 'MockApp', version: '1.0.0' }),
    getState: async () => ({ isActive: true }),
    minimizeApp: async () => console.log('App minimized'),
    exitApp: async () => console.log('App exited')
};

import { AppPort } from '@domain/ports/out/app/AppPort';

export const useAppAdapter = (): AppPort => MockApp;

```

## /Users/consultor/Development/boilerplate-app/src/infrastructure/capacitor/useCapacitorPreferencesStorageAdapter.ts
```ts
import { PreferencesStoragePort } from '@domain/ports/out/app/PreferencesStoragePort';

export const useCapacitorPreferencesStorageAdapter = (): PreferencesStoragePort => {
    return {
        async set(key: string, value: string): Promise<any> {
            localStorage.setItem(key, value);
            return Promise.resolve();
        },
        async get(key: string) {
            const value = localStorage.getItem(key);
            return Promise.resolve(value);
        },
        async remove(key: string) {
            localStorage.removeItem(key);
            return Promise.resolve();
        }
    }
}

```

## /Users/consultor/Development/boilerplate-app/src/infrastructure/capacitor/usePushNotificationsAdapter.ts
```ts
import { PushNotificationsPort } from "@domain/ports/out/device/PushNotificationsPort";

export const useCapacitorPushNotificationsAdapter =
    (): PushNotificationsPort => {
        return {
            checkPermissions: async () => {
                return true; // or 'denied' based on your test case
            },
        };
    };

```

## /Users/consultor/Development/boilerplate-app/src/infrastructure/firebase/useFirebaseAnalyticsAdapter.ts
```ts
import { AnalyticsPort } from "@domain/ports/out/analytics/AnalyticsPort";

// Mock implementation of FirebaseAnalytics
const MockFirebaseAnalytics = {
    initializeFirebase: (config: any) => {
        console.log("Firebase initialized with config:", config);
    },
    setUserId: async ({ userId }: { userId: string }) => {
        console.log("Set user ID:", userId);
    },
    setUserProperty: async ({ name, value }: { name: string, value: string }) => {
        console.log(`Set user property: ${name} = ${value}`);
    },
    logEvent: async ({ name, params }: { name: string, params: { [key: string]: string } }) => {
        console.log(`Logged event: ${name} with params:`, params);
    }
};

export const useFirebaseAnalyticsAdapter = (): AnalyticsPort => {
    try {
        MockFirebaseAnalytics.initializeFirebase({
            apiKey: import.meta.env.VITE_FIREBASE_ANALYTICS_APIKEY,
            authDomain: import.meta.env.VITE_FIREBASE_ANALYTICS_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_ANALYTICS_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_ANALYTICS_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_ANALYTICS_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_ANALYTICS_APP_ID,
            measurementId: import.meta.env.VITE_FIREBASE_ANALYTICS_MEASUREMENT_ID,
        });
    } catch (e) { }

    return {
        async setUserId(userId: string): Promise<void> {
            await MockFirebaseAnalytics.setUserId({ userId });
        },

        async setUserProperty(propertyName: string, value: string): Promise<void> {
            await MockFirebaseAnalytics.setUserProperty({ name: propertyName, value });
        },

        registerAction(action: string, view: string, params?: { [key: string]: string }): void {
            MockFirebaseAnalytics.logEvent({
                name: action,
                params: {
                    view,
                    ...params,
                },
            });
        },

        registerView(view: string, params?: { [key: string]: string }): void {
            MockFirebaseAnalytics.logEvent({
                name: "view",
                params: {
                    view,
                    ...params,
                },
            });
        }
    }
}

```

## /Users/consultor/Development/boilerplate-app/src/infrastructure/firebase/useFirebaseErrorTrackingAdapter.ts
```ts
import { ErrorTrackingPort } from "@domain/ports/out/analytics/ErrorTrackingPort";

const MockFirebaseCrashlytics = {
    log: async ({ message }: { message: string }) => {
        console.log(`Log: ${message}`);
    },
    recordException: async ({ message }: { message: string }) => {
        console.error(`Record Exception: ${message}`);
    },
    crash: async ({ message }: { message: string }) => {
        console.error(`Crash: ${message}`);
        throw new Error(message);
    }
};

export const useFirebaseErrorTrackingAdapter = (): ErrorTrackingPort => {
    return {
        async log(message: string): Promise<void> {
            await MockFirebaseCrashlytics.log({ message });
        },
        async recordError(message: string): Promise<void> {
            await MockFirebaseCrashlytics.recordException({ message });
        },
        async crash(message: string): Promise<void> {
            await MockFirebaseCrashlytics.crash({ message });
        }
    }
}

```

## /Users/consultor/Development/boilerplate-app/src/infrastructure/firebase/useFirebaseRemoteConfigAdapter.ts
```ts
import { RemoteConfigPort } from "@domain/ports/out/app/RemoteConfigPort";
import { useEffect, useRef } from "react";

// Mock initialize function
const initialize = () => {
    return {}; // Mock FirebaseApp
};

// Mock fetchAndActivate function
const fetchAndActivate = async () => {
    return Promise.resolve();
};

// Mock getRemoteConfig function
const getRemoteConfig = () => {
    return {}; // Mock RemoteConfig
};

// Mock getValueFromFirebase function
const getValueFromFirebase = () => {
    return {
        asString: () => JSON.stringify({ key1: "value1", key2: "value2" }) // Mock remote config values
    };
};

export const useFirebaseRemoteConfigAdapter = (): RemoteConfigPort => {
    const appRef = useRef<any | null>(null);
    const remoteConfigRef = useRef<any | null>(null);
    const isInitializedRef = useRef(false);
    const configRef = useRef<Record<string, any>>({});

    // Initialization of Firebase App and Remote Config
    useEffect(() => {
        appRef.current = initialize();

        if (appRef.current) {
            remoteConfigRef.current = getRemoteConfig();
            fetchAndActivate()
                .then(() => {
                    isInitializedRef.current = true;
                    const remoteConfigValue = getValueFromFirebase();
                    configRef.current = JSON.parse(remoteConfigValue.asString());
                    console.debug('Remote config values fetched and activated');
                })
                .catch((err) => {
                    console.error('Error fetching remote config values', err);
                });
        }
    }, []);

    // Methods to interact with remote config
    const getAll = () => {
        if (!isInitializedRef.current) {
            console.warn('RemoteConfig is not initialized yet. Waiting...', remoteConfigRef.current);
            throw new Error('RemoteConfig is not initialized yet. Waiting...');
        }
        return configRef.current;
    };

    const getValue = (key: string): any => {
        if (!isInitializedRef.current) {
            console.warn('RemoteConfig is not initialized yet. Waiting...', remoteConfigRef.current);
            throw new Error('RemoteConfig is not initialized yet. Waiting...');
        }
        return configRef.current[key];
    };

    const getNumber = (key: string, defaultValue?: number): number => {
        let raw: string | undefined;
        try {
            raw = getValue(key);
        } catch (error) {
            raw = defaultValue?.toString();
        }

        if (raw) {
            return Number(raw);
        }

        if (typeof defaultValue !== 'undefined') {
            return defaultValue;
        }

        throw new Error(`Remote Config: key ${key} not found`);
    };

    const getBoolean = (key: string, defaultValue?: boolean): boolean => {
        let raw: string | undefined;
        try {
            raw = getValue(key);
        } catch (error) {
            raw = defaultValue?.toString();
        }

        if (raw && ['true', 'false'].includes(raw)) {
            return raw === 'true';
        }

        if (typeof defaultValue !== 'undefined') {
            return defaultValue;
        }

        throw new Error(`Remote Config: key ${key} not found`);
    };

    return {
        getAll,
        getBoolean,
        getNumber,
        getValue,
    };
};

```

## /Users/consultor/Development/boilerplate-app/src/infrastructure/firebase/initializeApp.ts
```ts
import { getApp, getApps, initializeApp } from "firebase/app"

export const initialize = () => {
    if (!getApps().length) {
        return initializeApp({
            apiKey: import.meta.env.VITE_FIREBASE_ANALYTICS_APIKEY,
            authDomain: import.meta.env.VITE_FIREBASE_ANALYTICS_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_ANALYTICS_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_ANALYTICS_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_ANALYTICS_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_ANALYTICS_APP_ID,
            measurementId: import.meta.env.VITE_FIREBASE_ANALYTICS_MEASUREMENT_ID,
        })
    } else {
        return getApp()
    }
}

```

## /Users/consultor/Development/boilerplate-app/src/infrastructure/api/useAxiosHTTPClient.ts
```ts
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

```

## /Users/consultor/Development/boilerplate-app/src/infrastructure/api/useAuthorizedAxiosHTTPClient.ts
```ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useEffect, useRef, useCallback } from 'react';
import { HTTPRequest, HTTPResponse, HTTPService } from '@domain/ports/out/api/HTTPService';
import { merge } from 'lodash';
import { IAuthorizationPort } from '@domain/ports/in/IAuthorizationPort';

export const useAuthorizedAxiosHTTPClient = (auth: IAuthorizationPort, config?: Partial<HTTPRequest<any>>): HTTPService => {
    const { token, logout } = auth; // Obtener el token desde el contexto de autorización
    const httpConfigRef = useRef(mapToAxiosConfig(config || {}, token)); // Inicializar la configuración
    const axiosInstanceRef = useRef<AxiosInstance>(axios.create(httpConfigRef.current)); // Crear instancia de Axios

    // Actualizar configuración y crear nueva instancia de Axios si el token cambia
    useEffect(() => {
        httpConfigRef.current = mapToAxiosConfig(merge(httpConfigRef.current, config), token);
        axiosInstanceRef.current = axios.create(httpConfigRef.current);

        // Agregar interceptor para manejar errores de respuesta
        const interceptor = axiosInstanceRef.current.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.warn('Unauthorized: Token expired or invalid. Logging out...');
                    logout(); // Llamar a la función de logout
                }
                return Promise.reject(error); // Rechazar el error para que pueda ser manejado aguas abajo
            }
        );

        return () => {
            axiosInstanceRef.current.interceptors.response.eject(interceptor);
        };
    }, [token, logout]);

    // Función para actualizar manualmente la configuración
    const setConfig = useCallback((config: Partial<HTTPRequest<any>>) => {
        const updatedConfig = mapToAxiosConfig(merge(httpConfigRef.current, config), token);
        httpConfigRef.current = updatedConfig;
        axiosInstanceRef.current = axios.create(updatedConfig);
    }, [token]);

    // Función de solicitud HTTP
    const request = useCallback(async <T>(config: HTTPRequest<T>): Promise<HTTPResponse<T>> => {
        const axiosConfig = mapToAxiosConfig(merge(httpConfigRef.current, config), token);

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
                console.error('useAuthorizedAxiosHTTPClient Error:', error);
                throw {
                    type: 'UnexpectedError',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    originalError: error,
                };
            }
        }
    }, [token]); // Escuchar cambios en el token

    return {
        setConfig,
        request,
    };
};

// Función para mapear la configuración del cliente HTTP
function mapToAxiosConfig<T>(
    config: Partial<HTTPRequest<T>>,
    token?: string
): AxiosRequestConfig {
    return {
        baseURL: config.baseURL || undefined,
        method: config.method || 'GET',
        url: config.url,
        headers: {
            ...config.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        data: config.body,
        params: config.query || config.params,
        responseType: config.responseType || 'json',
        timeout: config.timeout,
        withCredentials: config.withCredentials,
        transformRequest: config.transformRequest,
        transformResponse: config.transformResponse,
    };
}


// Función para convertir los encabezados a un formato plano
function convertHeaders(headers: any): Record<string, string> {
    const result: Record<string, string> = {};
    if (headers) {
        Object.keys(headers).forEach((key) => {
            result[key] = headers[key] as string;
        });
    }
    return result;
}

```

## /Users/consultor/Development/boilerplate-app/src/infrastructure/api/useFetchHTTPClient.ts
```ts
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

```

## /Users/consultor/Development/boilerplate-app/src/infrastructure/api/useAuthorizationAPIClient.ts
```ts
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

```

## /Users/consultor/Development/boilerplate-app/src/infrastructure/api/useUserAPIClient.ts
```ts
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

```

## /Users/consultor/Development/boilerplate-app/src/presentation/pages/VersionUpdatePrompt.tsx
```tsx
import React from 'react';

interface IProps { }

const VersionUpdatePrompt: React.FC<IProps> = () => {
    return (
        <div className="modal">
            <div className="header">
                <div className="toolbar">
                    <h1>Actualización Disponible</h1>
                </div>
            </div>
            <div className="content padding">
                <h1>Actualización Disponible</h1>
                <center>Hay una nueva actualización disponible</center>
                <center>v0.0.1</center>
            </div>
            <div className="footer">
                <button className="strong" onClick={() => confirm()}>
                    Actualizar
                </button>
            </div>
        </div>
    );
};

export default VersionUpdatePrompt;

```

## /Users/consultor/Development/boilerplate-app/src/presentation/pages/NotFound.tsx
```tsx
import { useNavigate } from 'react-router';

interface IProps { }

const NotFound: React.FC<IProps> = () => {

    const navigate = useNavigate()

    return (
        <div>
            <header>
                <div>
                    <button onClick={() => navigate(-1)}>
                        <span>Volver</span>
                    </button>
                    <h1>No encontrado</h1>
                </div>
            </header>
            <main>
                <h1>Está vista no existe</h1>
            </main>
        </div>
    );
};

export default NotFound;

```

## /Users/consultor/Development/boilerplate-app/src/presentation/pages/NotImplemented.tsx
```tsx
interface IProps { }

const NotImplemented: React.FC<IProps> = () => {
    return (
        <div>
            <div>
                NotImplemented
            </div>
        </div>
    );
};

export default NotImplemented;

```

## /Users/consultor/Development/boilerplate-app/src/presentation/pages/Home/Home.tsx
```tsx
interface IProps { }

const Home: React.FC<IProps> = () => {
    return (
        <div>
            Home
        </div>
    );
};

export default Home;

```

## /Users/consultor/Development/boilerplate-app/src/providers/withBooting.tsx
```tsx
import React, { ReactNode } from "react";
import { composeProviders } from "@providers/composeProvider";
import { withAnalyticsProvider } from "@providers/withAnalyticsProvider";
import { withAppProvider } from "@providers/withAppProvider";
import { withErrorTrackingProvider } from "@providers/withErrorTrackingProvider";
import { withPreferencesStorageProvider } from "@providers/withPreferencesStorageProvider";
import { withPushNotificationsProvider } from "@providers/withPushNotificationProvider";
import { withRemoteConfigProvider } from "@providers/withRemoteConfigProvider";
import { withServiceWorkerProvider } from "./withServiceWorkerProvider";

export const withBooting = (children: ReactNode) => {
    const BootedProviders = React.useMemo(
        () => composeProviders(
            withServiceWorkerProvider,
            withAppProvider,
            withRemoteConfigProvider,
            withAnalyticsProvider,
            withErrorTrackingProvider,
            withPushNotificationsProvider,
            withPreferencesStorageProvider,
        ),
        []
    );

    // Renderizar la aplicación envuelta en todos los providers
    return <BootedProviders>{children}</BootedProviders>;
};

```

## /Users/consultor/Development/boilerplate-app/src/providers/withProvider.tsx
```tsx
import React, { ComponentType, PropsWithChildren } from "react";
import { composeProviders } from "./composeProvider";

export const withProvider = <P extends object>(
    providers: React.FC<PropsWithChildren> | React.FC<PropsWithChildren>[],
    Component: ComponentType<P>
): React.FC<P> => {
    // Maneja un único provider convirtiéndolo en un array
    const ComposedProviders = Array.isArray(providers)
        ? composeProviders(...providers)
        : ({ children }: PropsWithChildren) => React.createElement(providers, { children });

    // Retorna el componente envuelto en los providers compuestos
    return (props: P) => (
        <ComposedProviders>
            <Component {...props} />
        </ComposedProviders>
    );
};

```

## /Users/consultor/Development/boilerplate-app/src/providers/withPushNotificationProvider.tsx
```tsx
import React, { createContext, ReactNode, useContext, useState, useEffect, ComponentType, useRef } from 'react';
import { PushNotificationsPort } from '@domain/ports/out/device/PushNotificationsPort';
import { useCapacitorPushNotificationsAdapter } from '@infrastructure/capacitor/usePushNotificationsAdapter';

const PushNotificationsContext = createContext<PushNotificationsPort | null>(null);

// Initialize with Capacitor Push Notification
const createCapacitorPushNotificationsService = (): PushNotificationsPort => {
    return useCapacitorPushNotificationsAdapter()
};

export const withPushNotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [initialized, setInitialized] = useState(false);
    const pushNotificationsService = useRef<PushNotificationsPort>(createCapacitorPushNotificationsService());

    useEffect(() => {
        const loadConfig = async () => {
            await pushNotificationsService.current.checkPermissions()
            setInitialized(true);
        };

        loadConfig();
    }, []);

    if (!initialized || !pushNotificationsService.current) {
        return <div>Espere...</div>;
    }

    return (
        <PushNotificationsContext.Provider value={pushNotificationsService.current} >
            {children}
        </PushNotificationsContext.Provider>
    );
};

export const withPushNotifications = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const pushNotification = usePushNotifications();
        return <WrappedComponent {...props} pushNotification={{ ...pushNotification }
        } />;
    };
};


export const usePushNotifications = (): PushNotificationsPort => {
    const context = useContext(PushNotificationsContext);
    if (!context) {
        throw new Error('useRemoteConfig debe ser usado dentro de withRemoteConfigProvider');
    }
    return context;
};

```

## /Users/consultor/Development/boilerplate-app/src/providers/withAppProvider.tsx
```tsx
import React, { createContext, ReactNode, useContext, useState, useEffect, ComponentType, useRef } from 'react';
import { AppPort } from '@domain/ports/out/app/AppPort';
import { useAppAdapter } from '@infrastructure/capacitor/useAppAdapter';

const AppContext = createContext<AppPort | null>(null);

// Initialize with Firebase Adapter
const createAppService = (): AppPort => {
    return useAppAdapter()
};

export const withAppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const appServiceRef = useRef<AppPort | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!appServiceRef.current) {
            appServiceRef.current = createAppService();
        }
        setInitialized(true);
    }, []);

    if (!initialized || !appServiceRef.current) {
        return <div>Espere...</div>;
    }

    return (
        <AppContext.Provider value={appServiceRef.current}>
            {children}
        </AppContext.Provider>
    );
};

export const withApp = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const app = useApp();
        return <WrappedComponent {...props} app={{ ...app }} />;
    };
};

export const useApp = (): AppPort => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp debe ser usado dentro de withAppProvider');
    }
    return context;
};

```

## /Users/consultor/Development/boilerplate-app/src/providers/UserProvider.tsx
```tsx
import React, { createContext, ReactNode, useContext, ComponentType, useRef } from 'react';
import { usePreferencesStorage } from '@providers/withPreferencesStorageProvider';
import { useUserUseCase } from '@application/user/useUserUseCase';
import { useAuth } from './AuthProvider';
import { useUserAPIClient } from '@infrastructure/api/useUserAPIClient';
import { IUserPort } from '@domain/ports/in/IUserPort';
import { useAuthorizedAxiosHTTPClient } from '@infrastructure/api/useAuthorizedAxiosHTTPClient';

const UserProviderContext = createContext<IUserPort | null>(null);


export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth()
    const useUserAPI = useRef(useUserAPIClient(useAuthorizedAxiosHTTPClient(auth)))
    const useStorage = useRef(usePreferencesStorage())
    const useCases = useUserUseCase(useUserAPI.current, auth, useStorage.current)

    return (
        <UserProviderContext.Provider value={useCases}>
            {children}
        </UserProviderContext.Provider>
    );
};

export const withUserProvider = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        return (
            <UserProvider>
                <WrappedComponent {...props} />
            </UserProvider>
        );
    };
};

export const withUser = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const user = useUser();
        return <WrappedComponent {...props} user={{ ...user }} />;
    };
};


export const useUser = () => {
    const context = useContext(UserProviderContext);
    if (!context) {
        throw new Error('useUser debe ser usado dentro de UserProvider');
    }
    return context;
};

```

## /Users/consultor/Development/boilerplate-app/src/providers/withErrorTrackingProvider.tsx
```tsx
import React, { createContext, ReactNode, useContext, useState, useEffect, ComponentType, useRef } from "react";
import { ErrorTrackingPort } from "@domain/ports/out/analytics/ErrorTrackingPort";
import { useFirebaseErrorTrackingAdapter } from "@infrastructure/firebase/useFirebaseErrorTrackingAdapter";

const ErrorTrackingContext = createContext<ErrorTrackingPort | null>(null);

// Inicializa el servicio con Firebase Adapter
const createFirebaseErrorTrackingService = (): ErrorTrackingPort => {
    return useFirebaseErrorTrackingAdapter();
};

export const withErrorTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const errorTrackingService = useRef<ErrorTrackingPort>(createFirebaseErrorTrackingService());
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const initializeErrorTracking = async () => {
            setInitialized(true);
            // window.onerror = (message, source, lineno, colno, error) => {
            //     try {
            //         errorTrackingService.current.recordError(JSON.stringify(error));
            //     } catch (err) {
            //         console.warn("Error al registrar el error:", err);
            //     }
            //     return true;
            // };

            // window.addEventListener("unhandledrejection", (event) => {
            //     try {
            //         if (event.reason) errorTrackingService.current.recordError(JSON.stringify(event.reason));
            //     } catch (err) {
            //         console.warn("Error al registrar el rechazo:", err);
            //     }
            //     event.preventDefault();
            // });
        };

        initializeErrorTracking();
    }, []);

    if (!initialized || !errorTrackingService.current) {
        return <div>Espere...</div>;
    }

    return (
        <ErrorTrackingContext.Provider value={errorTrackingService.current}>
            {children}
        </ErrorTrackingContext.Provider>
    );
};

export const withErrorTracking = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const errorTracking = useErrorTracking();
        return <WrappedComponent {...props} errorTracking={errorTracking} />;
    };
};

export const useErrorTracking = (): ErrorTrackingPort => {
    const context = useContext(ErrorTrackingContext);
    if (!context) {
        throw new Error("useErrorTracking debe ser usado dentro de withErrorTrackingProvider");
    }
    return context;
};

```

## /Users/consultor/Development/boilerplate-app/src/providers/ExampleProvider.template.tsx
```tsx
import { ComponentType, createContext, ReactNode, useContext, useState } from 'react';

const ExampleSimpleContext = createContext<any | null>(null);

export const ExampleSimpleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [useCase, _] = useState()

    return (
        <ExampleSimpleContext.Provider value={useCase}>
            {children}
        </ExampleSimpleContext.Provider>
    );
};

export const withExampleSimple = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const exampleSimple = useExampleSimple();
        return <WrappedComponent {...props} {...{ exampleSimple }
        } />;
    };
};

export const useExampleSimple = () => {
    const context = useContext(ExampleSimpleContext);
    if (!context) {
        throw new Error('useExampleSimple must be used within a ExampleSelectionProvider');
    }
    return context;
};

```

## /Users/consultor/Development/boilerplate-app/src/providers/withPreferencesStorageProvider.tsx
```tsx
import React, { createContext, ReactNode, useContext, useState, useEffect, ComponentType } from 'react';
import { PreferencesStoragePort } from '@domain/ports/out/app/PreferencesStoragePort';
import { useCapacitorPreferencesStorageAdapter } from '@infrastructure/capacitor/useCapacitorPreferencesStorageAdapter';

const PreferencesStorageContext = createContext<PreferencesStoragePort | null>(null);

const createCapacitorPreferencesStorageService = (): PreferencesStoragePort => {
    return useCapacitorPreferencesStorageAdapter()
};

export const withPreferencesStorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [preferencesStorageService, setPreferencesStorageService] = useState<PreferencesStoragePort | undefined>();

    useEffect(() => {
        const loadConfig = async () => {
            const service = createCapacitorPreferencesStorageService()
            setPreferencesStorageService(service)
        };

        loadConfig();
    }, []);

    if (!preferencesStorageService) {
        return <div>Espere...</div>;
    }

    return (
        <PreferencesStorageContext.Provider value={preferencesStorageService} >
            {children}
        </PreferencesStorageContext.Provider>
    );
};

export const withPreferencesStorage = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const preferencesStorage = usePreferencesStorage();
        return <WrappedComponent {...props} {...{ preferencesStorage }
        } />;
    };
};

export const usePreferencesStorage = (): PreferencesStoragePort => {
    const context = useContext(PreferencesStorageContext);
    if (!context) {
        throw new Error('usePreferencesStorage debe ser usado dentro de withRemoteConfigProvider');
    }
    return context;
};

```

## /Users/consultor/Development/boilerplate-app/src/providers/withRemoteConfigProvider.tsx
```tsx
import React, { createContext, ReactNode, useContext, useState, useEffect, ComponentType, useRef } from 'react';
import { RemoteConfigPort } from '@domain/ports/out/app/RemoteConfigPort';
import { useFirebaseRemoteConfigAdapter } from '@infrastructure/firebase/useFirebaseRemoteConfigAdapter';

const RemoteConfigContext = createContext<RemoteConfigPort | null>(null);

// Initialize with Firebase Adapter
export const withRemoteConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const remoteConfigServiceRef = useRef<RemoteConfigPort | null>(useFirebaseRemoteConfigAdapter());
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        setInitialized(true);
    }, []);

    if (!initialized || !remoteConfigServiceRef.current) {
        return <div>Espere...</div>
    }

    return (
        <RemoteConfigContext.Provider value={remoteConfigServiceRef.current}>
            {children}
        </RemoteConfigContext.Provider>
    );
};

export const withRemoteConfig = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const remoteConfig = useRemoteConfig();
        return <WrappedComponent {...props} remoteConfig={{ ...remoteConfig }} />;
    };
};

export const useRemoteConfig = (): RemoteConfigPort => {
    const context = useContext(RemoteConfigContext);
    if (!context) {
        throw new Error('useRemoteConfig debe ser usado dentro de withRemoteConfigProvider');
    }
    return context;
};

```

## /Users/consultor/Development/boilerplate-app/src/providers/composeProvider.tsx
```tsx
import { ReactNode } from "react";

export const composeProviders =
    (...providers: Array<React.FC<{ children: ReactNode }>>) =>
        ({ children }: { children: ReactNode }) =>
            providers.reduceRight(
                (acc, Provider) => <Provider>{acc}</Provider>,
                children
            );

```

## /Users/consultor/Development/boilerplate-app/src/providers/FrameworkProvider.tsx
```tsx
import React, { useEffect } from 'react';
import { loadStyles } from '@theme/styles/styles';
import FrameworkGlobalStyles from '@theme/FrameworkGlobalStyles';
import { useTheme, ThemeProvider } from 'styled-components';


export const FrameworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = useTheme()

    loadStyles
    useEffect(() => {
        const handleBackButton = (event: any) => {
            event.preventDefault();

            // Si hay historial disponible, retrocede
            if (window.history.length > 1) {
                window.history.back(); // Retrocede una página en el historial del navegador
            } else {
                console.log('No hay historial para retroceder.');
            }
        };

        // Escuchar el evento de hardware back
        document.addEventListener('backButton', handleBackButton);

        return () => {
            // Limpia el listener al desmontar el componente
            document.removeEventListener('backButton', handleBackButton);
        };
    }, []);

    return (
        <ThemeProvider theme={{ ...theme }}>
            <FrameworkGlobalStyles />
            {/* <IonApp> */}
            {children}
            {/* </IonApp> */}
        </ThemeProvider>

    )
};

```

## /Users/consultor/Development/boilerplate-app/src/providers/withServiceWorkerProvider.tsx
```tsx
import React, { createContext, ReactNode, useEffect, useState } from "react";

const ServiceWorkerContext = createContext<boolean>(false);

export const withServiceWorkerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isServiceWorkerAvailable, setIsServiceWorkerAvailable] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            if (import.meta.env.VITE_ENVIRONMENT == "test") {
                setIsServiceWorkerAvailable(true);
                return
            }
            navigator.serviceWorker.register('/service-worker.js')
                .then(() => {
                    console.log('Service Worker registrado con éxito.');
                    setIsServiceWorkerAvailable(true);
                })
                .catch((error) => {
                    console.error('Error al registrar el Service Worker:', error);
                });
        } else {
            console.warn('Service Worker no está soportado en este navegador.');
            setIsServiceWorkerAvailable(false);
        }
    }, []);

    if (!isServiceWorkerAvailable) {
        return <div>Espere...</div>;
    }

    return (
        <ServiceWorkerContext.Provider value={isServiceWorkerAvailable}>
            {children}
        </ServiceWorkerContext.Provider>
    );
};

export const useServiceWorker = (): boolean => {
    const context = React.useContext(ServiceWorkerContext);
    if (context === undefined) {
        throw new Error("useServiceWorker debe ser usado dentro de withServiceWorkerProvider");
    }
    return context;
};

```

## /Users/consultor/Development/boilerplate-app/src/providers/AuthProvider.tsx
```tsx
import { useAuthorizationUseCase } from '@application/auth/useAuthorizationUseCase';
import { useAuthorizationAPIClient } from '@infrastructure/api/useAuthorizationAPIClient';
import React, { createContext, ReactNode, useContext, ComponentType, useRef } from 'react';
import { usePreferencesStorage } from '@providers/withPreferencesStorageProvider';
import { useAxiosHTTPClient } from '@infrastructure/api/useAxiosHTTPClient';
import { IAuthorizationPort } from '@domain/ports/in/IAuthorizationPort';

const AuthProviderContext = createContext<IAuthorizationPort | null>(null);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const useAuthAPI = useRef(useAuthorizationAPIClient(useAxiosHTTPClient()))
    const useStorage = useRef(usePreferencesStorage())
    const useCases = useAuthorizationUseCase(useAuthAPI.current, useStorage.current)
    return (
        <AuthProviderContext.Provider value={useCases}>
            {children}
        </AuthProviderContext.Provider>
    );
};

export const withAuthProvider = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        return (
            <AuthProvider>
                <WrappedComponent {...props} />
            </AuthProvider>
        );
    };
};

export const withAuth = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const auth = useAuth();
        return <WrappedComponent {...props} auth={{ ...auth }} />;
    };
};


export const useAuth = (): IAuthorizationPort => {
    const context = useContext(AuthProviderContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};

```

## /Users/consultor/Development/boilerplate-app/src/providers/withAnalyticsProvider.tsx
```tsx
import React, {
    createContext,
    ReactNode,
    useContext,
    useState,
    ComponentType,
    useRef,
} from 'react';
import { AnalyticsPort } from '@domain/ports/out/analytics/AnalyticsPort';
import { useFirebaseAnalyticsAdapter } from '@infrastructure/firebase/useFirebaseAnalyticsAdapter';

const AnalyticsContext = createContext<AnalyticsPort | null>(null);

const createFirebaseAnalyticsService = (): AnalyticsPort => {
    return useFirebaseAnalyticsAdapter();
};

export const withAnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const analyticsServiceRef = useRef<AnalyticsPort | null>(null);
    const [initialized, setInitialized] = useState(false);


    if (!analyticsServiceRef.current) {
        analyticsServiceRef.current = createFirebaseAnalyticsService();
        setInitialized(true)
    }

    if (!initialized || !analyticsServiceRef.current) {
        return <div>Espere...</div>;
    }

    return (
        <AnalyticsContext.Provider value={analyticsServiceRef.current}>
            {children}
        </AnalyticsContext.Provider>
    );
};


export const withAnalytics = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const analytics = useAnalytics();
        return <WrappedComponent {...props} analytics={analytics} />;
    };
};

export const useAnalytics = (): AnalyticsPort => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics debe ser usado dentro de withAnalyticsProvider');
    }
    return context;
};

```

## /Users/consultor/Development/boilerplate-app/src/routes/index.tsx
```tsx
import {
    createBrowserRouter,
    Navigate,
} from "react-router-dom";
import NotFound from "@presentation/pages/NotFound";
import { PublicRoute } from "@routes/routeGuards";
import auth from "./auth";
import app from "./app";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <PublicRoute />,
        errorElement: <NotFound />,
        children: [
            {
                path: "",
                element: <PublicRoute component={<Navigate to={"/auth/login"} replace />} />
            },
            {
                path: "debug",
                element: <div>Debug Page</div>
            },
            ...auth,
            ...app
        ]
    },
]);

export default router

```

## /Users/consultor/Development/boilerplate-app/src/routes/auth.tsx
```tsx
import { Navigate } from "react-router";
import { ProtectedRouteByRoles, PublicUnAuthorizedRoute } from "./routeGuards";
import Login from "@presentation/pages/Register/Login";
import Email from "@presentation/pages/Register/Email";
import OTP from "@presentation/pages/Register/OTP";

export default [
    {
        path: "auth",
        element: <PublicUnAuthorizedRoute />,
        children: [
            {
                path: "",
                element: <Navigate to={"/auth/login"} replace />
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "email",
                element: <Email />,
            },
            {
                path: "otp",
                element: <OTP />,
            },
        ],
    },
    {
        path: "auth/register",
        element: <ProtectedRouteByRoles
            roles={['INVITED']}
            component={<Login />}
            notRoleComponent={<Navigate to={"/auth/login"} replace />}
        />,
    },
]

```

## /Users/consultor/Development/boilerplate-app/src/routes/app.tsx
```tsx
import { Navigate, Outlet } from "react-router";
import { ProtectedRouteByRoles, PublicRoute } from "./routeGuards";
import Home from "@presentation/pages/Home/Home";

const home = {
    path: "home",
    element: <Home />
}


export default [{
    path: "app",
    element: <>
        <PublicRoute
            component={<Outlet />}
        />
    </>,
    children: [
        {
            path: "",
            element: <Navigate to={"/app/home"} replace />
        },
        home,
    ],
}]

```

## /Users/consultor/Development/boilerplate-app/src/routes/routeGuards.tsx
```tsx
import { IUserRole } from "@domain/models/entities/IUser";
import { useAuth } from "@providers/AuthProvider";
import { useUser } from "@providers/UserProvider";
import React from "react";
import { Navigate, Outlet } from "react-router";

interface RouteProps {
    component?: React.FC<any> | JSX.Element;
}
interface ProtectedRouteByRoleProps {

    roles?: Array<IUserRole>;
    notRoleComponent?: React.FC<any> | JSX.Element;
}


const BuildComponent: React.FC<{ component?: React.ElementType | JSX.Element }> = ({ component }) => {
    if (React.isValidElement(component)) {
        // Si `component` es un elemento JSX
        return component;
    }

    if (typeof component === "function") {
        // Si `component` es un componente funcional
        const Component = component;
        return <Component />;
    }

    // Si no se proporciona componente, renderiza <Outlet />
    return <Outlet />;
};

export const PublicRoute: React.FC<RouteProps> = ({ component }) => {
    return <BuildComponent component={component} />;
};

export const PublicUnAuthorizedRoute = () => {
    const auth = useAuth()

    if (!auth.isReady) {
        return <div></div>;
    }

    if (auth.isAuthenticated) {
        return <Navigate to={"/app/home/dashboard"} replace />
    }
    return <Outlet />;
};


export const ProtectedRouteByRoles: React.FC<ProtectedRouteByRoleProps & RouteProps> = ({
    component: Component,
    roles = ['USER'],
    notRoleComponent: NotRoleComponent,
}) => {
    const auth = useAuth();
    const user = useUser();

    if (!auth.isReady) {
        return <div></div>;
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (!user.role) {
        return <div></div>;
    }

    if (!roles.includes(user.role)) {
        return (
            <BuildComponent
                component={
                    NotRoleComponent || (
                        <div>
                            <div>
                                <center>
                                    Rol "{user.role}" no tiene permiso para acceder:{" "}
                                    {JSON.stringify(roles)}
                                </center>
                            </div>
                        </div>
                    )
                }
            />
        );
    }

    return <BuildComponent component={Component} />;
};

```

