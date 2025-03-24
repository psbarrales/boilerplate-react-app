## Arquitectura del Proyecto

El proyecto sigue la **arquitectura hexagonal (Hexagonal Architecture)**, también conocida como **arquitectura de puertos y adaptadores**. Esta arquitectura promueve la **modularización del código**, facilitando la mantenibilidad y la escalabilidad de la aplicación.

### Estructura General del Proyecto

La estructura del proyecto se divide en diferentes carpetas y sub-carpetas, cada una con un propósito específico. A continuación, se detalla cada una de estas carpetas y se proporcionan ejemplos con el código actual.

### Estructura de Directorios

```plaintext
src/
├── App.tsx
├── __test__/
├── application/
├── domain/
├── hooks/
├── infrastructure/
├── main.tsx
├── presentation/
├── providers/
├── routes/
├── setupTests.ts
├── theme/
└── vite-env.d.ts
```

---

## Detalle de las Carpetas y Subcarpetas

### 2.1. `domain/`

**Ubicación:** `src/domain/`

#### Descripción

La carpeta `domain/` contiene la **lógica de negocio pura** de la aplicación. Aquí se definen:

- **Modelos (Entidades):** Representaciones de los objetos del dominio.
- **Puertos (Interfaces):** Contratos que definen cómo otras capas pueden interactuar con el dominio.

#### Estructura

```plaintext
domain/
├── models/
│   └── entities/
│       ├── IJwt.ts
│       ├── IJwtDecode.ts
│       └── IUser.ts
└── ports/
    ├── analytics/
    │   ├── AnalyticsPort.ts
    │   └── ErrorTrackingPort.ts
    ├── app/
    │   ├── AppPort.ts
    │   ├── PreferencesStoragePort.ts
    │   └── RemoteConfigPort.ts
    ├── api/
    │   ├── AuthorizationServicePort.ts
    │   ├── HTTPService.ts
    │   └── UserServicePort.ts
    └── device/
        └── PushNotificationsPort.ts
```

#### Ejemplos

1. **Definición de una Entidad de Usuario (`IUser.ts`):**

```typescript
// src/domain/models/entities/IUser.ts

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

2. **Definición de un Puerto de Autorización (`AuthorizationServicePort.ts`):**

```typescript
// src/domain/ports/out/api/AuthorizationServicePort.ts

import { IJwt } from "@domain/models/entities/IJwt";

export interface AuthorizationServicePort {
    registerInvite(): Promise<IJwt>
    registerEmail(email: string): Promise<any>
    checkCode(code: string, email: string): Promise<IJwt>
    login(user: string, pass: string): Promise<any>
    logout(): Promise<void>
}
```

### 2.2. `application/`

**Ubicación:** `src/application/`

#### Descripción

La carpeta `application/` contiene los **casos de uso** de la aplicación, implementados como **hooks** de React. Estos casos de uso utilizan los puertos y modelos definidos en el dominio.

#### Estructura

```plaintext
application/
├── auth/
│   └── useAuthorizationUseCase.ts
└── user/
    └── useUserUseCase.ts
```

#### Ejemplos

1. **Caso de Uso de Autorización (`useAuthorizationUseCase.ts`):**

```typescript
// src/application/auth/useAuthorizationUseCase.ts

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
                setIsAuthenticated(false)
                const response: IJwt = await api.registerInvite()
                setToken(response.access_token)
                return response
            case 'EMAIL':
                setIsAuthenticated(false)
                const email = param
                const response = await api.registerEmail(email)
                return response
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

2. **Caso de Uso de Usuario (`useUserUseCase.ts`):**

```typescript
// src/application/user/useUserUseCase.ts

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


### 2.3. `infrastructure/`

**Ubicación:** `src/infrastructure/`

#### Descripción

La carpeta `infrastructure/` contiene las **implementaciones concretas** de los puertos definidos en el dominio. Aquí es donde se conecta la aplicación con tecnologías y servicios externos, como APIs y almacenamiento.

#### Estructura

```plaintext
infrastructure/
├── api/
│   ├── useAxiosHTTPClient.ts
│   ├── useAuthorizedAxiosHTTPClient.ts
│   ├── useFetchHTTPClient.ts
│   ├── useAuthorizationAPIClient.ts
│   └── useUserAPIClient.ts
├── capacitor/
│   ├── useAppAdapter.ts
│   ├── useCapacitorPreferencesStorageAdapter.ts
│   └── usePushNotificationsAdapter.ts
└── firebase/
    ├── initializeApp.ts
    ├── useFirebaseAnalyticsAdapter.ts
    ├── useFirebaseErrorTrackingAdapter.ts
    └── useFirebaseRemoteConfigAdapter.ts
```

#### Ejemplos

1. **Implementación de HttpClient (`useAxiosHTTPClient.ts`):**

```typescript
// src/infrastructure/api/useAxiosHTTPClient.ts

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

    function mapToAxiosConfig<T>(
        config: Partial<HTTPRequest<T>>
    ): AxiosRequestConfig {
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

    return {
        setConfig,
        request,
    };
};
```

2. **Implementación de `IAuthorizationServicePort` con Axios (`useAuthorizationAPIClient.ts`):**

```typescript
// src/infrastructure/api/useAuthorizationAPIClient.ts

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
    const login = useCallback(async (user: string, pass: string): Promise<any> => {
        const response = await httpServiceRef.current.request({
            method: 'POST',
            url: '/auth/login',
            body: { user, pass },
            responseType: 'json',
        });
        return response.data;
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

### 2.4. `application/`

**Ubicación:** `src/application/`

#### Descripción

La carpeta `application/` contiene los **casos de uso** de la aplicación, que se implementan como **hooks de React**. Estos casos de uso utilizan los puertos y modelos definidos en el dominio.

#### Estructura

```plaintext
application/
├── auth/
│   └── useAuthorizationUseCase.ts
└── user/
    └── useUserUseCase.ts
```

#### Ejemplos

1. **Caso de Uso de Autorización (`useAuthorizationUseCase.ts`):**

```typescript
// src/application/auth/useAuthorizationUseCase.ts

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
                setIsAuthenticated(false)
                const response: IJwt = await api.registerInvite()
                setToken(response.access_token)
                return response
            case 'EMAIL':
                setIsAuthenticated(false)
                const email = param
                const response = await api.registerEmail(email)
                return response
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

2. **Caso de Uso de Usuario (`useUserUseCase.ts`):**

```typescript
// src/application/user/useUserUseCase.ts

import { useCallback, useEffect, useState } from "react";
import { IUser, IUserRole } from "@domain/models/entities/IUser";
import { PreferencesStoragePort } from "@domain/ports/out/app/PreferencesStoragePort";
import { UserServicePort } from "@domain/ports/out/api/UserServicePort";
import { IAuthorizationPort } from "@domain/ports/in/IAuthorizationPort";
import { IUserPort } from "@domain/ports/in/IUserPort";

export const useUserUseCase =
    (api: UserServicePort, storage: PreferencesStoragePort, auth: IAuthorizationPort):
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

### 2.5. `infrastructure/`

**Ubicación:** `src/infrastructure/`

#### Descripción

La carpeta `infrastructure/` contiene las **implementaciones concretas** de los puertos definidos en el dominio. Aquí es donde se conecta la aplicación con tecnologías y servicios externos, como APIs y almacenamiento.

#### Estructura

```plaintext
infrastructure/
├── api/
│   ├── useAxiosHTTPClient.ts
│   ├── useAuthorizedAxiosHTTPClient.ts
│   ├── useFetchHTTPClient.ts
│   ├── useAuthorizationAPIClient.ts
│   └── useUserAPIClient.ts
├── capacitor/
│   ├── useAppAdapter.ts
│   ├── useCapacitorPreferencesStorageAdapter.ts
│   └── usePushNotificationsAdapter.ts
└── firebase/
    ├── initializeApp.ts
    ├── useFirebaseAnalyticsAdapter.ts
    ├── useFirebaseErrorTrackingAdapter.ts
    └── useFirebaseRemoteConfigAdapter.ts
```

#### Ejemplos

1. **Implementación de HttpClient (`useAxiosHTTPClient.ts`):**

```typescript
// src/infrastructure/api/useAxiosHTTPClient.ts

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

    return {
        setConfig,
        request,
    };
};
```

2. **Implementación de `IAuthorizationAPIClient` con Axios (`useAuthorizationAPIClient.ts`):**

```typescript
// src/infrastructure/api/useAuthorizationAPIClient.ts

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

    const login = useCallback(async (user: string, pass: string): Promise<any> => {
        const response = await httpServiceRef.current.request({
            method: 'POST',
            url: '/auth/login',
            body: { user, pass },
            responseType: 'json',
        });
        return response.data;
    }, []);

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

### 2.6. `presentation/`

**Ubicación:** `src/presentation/`

#### Descripción

La carpeta `presentation/` contiene las **páginas** y **componentes** de la interfaz de usuario. Aquí se construye la vista utilizando los componentes de UI y estilos necesarios para interactuar con el usuario.

#### Estructura

```plaintext
presentation/
├── components/
├── layout/
└── pages/
    ├── VersionUpdatePrompt.tsx
    ├── NotFound.tsx
    ├── NotImplemented.tsx
    ├── Home/
    │   ├── Home.tsx
    └── Register/
        ├── Login.tsx
        ├── Email.tsx
        └── OTP.tsx
```

#### Ejemplos

1. **Página de Login (`Login.tsx`):**

```typescript
// src/presentation/pages/Register/Login.tsx

import React, { useState } from 'react';
import { useAuth } from '@providers/AuthProvider';
import { XButton } from '@theme/components/XButton';
import { XInput } from '@theme/components/XInput';
import { XPage } from '@theme/components/XPage';

export const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await login(email, password);
    };

    return (
        <XPage title="Iniciar Sesión">
            <form onSubmit={handleSubmit}>
                <XInput
                    label="Correo Electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <XInput
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <XButton type="submit">Ingresar</XButton>
            </form>
        </XPage>
    );
};
```

2. **Componente de Pagina 404 (`NotFound.tsx`):**

```typescript
// src/presentation/pages/NotFound.tsx

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
                <h1>Esta página no existe</h1>
            </main>
        </div>
    );
};

export default NotFound;
```

### 2.7. `providers/`

**Ubicación:** `src/providers/`

#### Descripción

Los **Providers** son responsables de inyectar las dependencias y proporcionar los contextos necesarios a los componentes de la aplicación. Utilizan el **Context API** de React y pueden envolver a componentes con los adaptadores de infraestructura necesarios.

#### Estructura

```plaintext
providers/
├── AuthProvider.tsx
├── FrameworkProvider.tsx
├── UserProvider.tsx
├── composeProvider.tsx
├── withAnalyticsProvider.tsx
├── withAppProvider.tsx
├── withBooting.tsx
├── withErrorTrackingProvider.tsx
├── withPreferencesStorageProvider.tsx
├── withPushNotificationProvider.tsx
└── withRemoteConfigProvider.tsx
```

#### Ejemplos

1. **`AuthProvider.tsx`:**

```typescript
// src/providers/AuthProvider.tsx

import React, { createContext, ReactNode, useContext, useState, useEffect, ComponentType, useRef } from 'react';
import { useAuthorizationUseCase } from '../application/auth/useAuthorizationUseCase';
import { useAuthorizationAPIClient } from '../infrastructure/api/useAuthorizationAPIClient';
import { IUser } from '../domain/models/entities/IUser';
import { IAuthorizationPort } from '../domain/ports/in/IAuthorizationPort';
import { usePreferencesStorage } from '@providers/withPreferencesStorageProvider';
import { useAuthorizedAxiosHTTPClient } from '@infrastructure/api/useAuthorizedAxiosHTTPClient';

const AuthProviderContext = createContext<IAuthorizationPort | null>(null);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const useAuthAPI = useRef(useAuthorizationAPIClient(useAuthorizedAxiosHTTPClient(usePreferencesStorage())))
    const useCases = useAuthorizationUseCase(useAuthAPI.current)

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

2. **`composeProvider.tsx`:**

```typescript
// src/providers/composeProvider.tsx

import React, { ReactNode } from 'react';

export const composeProvider =
    (...providers: Array<React.FC<{ children: ReactNode }>>) =>
        ({ children }: { children: ReactNode }) =>
            providers.reduceRight(
                (acc, Provider) => <Provider>{acc}</Provider>,
                children
            );
```

### 2.8. `presentation/`

**Ubicación:** `src/presentation/`

#### Descripción

La carpeta `presentation/` contiene las **páginas** y **componentes** de la interfaz de usuario. Aquí se construye la vista utilizando los componentes de UI y estilos necesarios para interactuar con el usuario.

#### Estructura

```plaintext
presentation/
├── components/
├── layout/
└── pages/
    ├── VersionUpdatePrompt.tsx
    ├── NotFound.tsx
    ├── NotImplemented.tsx
    ├── Home/
    │   ├── Home.tsx
    └── Register/
        ├── Login.tsx
        ├── Email.tsx
        └── OTP.tsx
```

#### Ejemplos

1. **Página de Login (`Login.tsx`):**

```typescript
// src/presentation/pages/Register/Login.tsx

import React, { useState } from 'react';
import { useAuth } from '@providers/AuthProvider';
import { XButton } from '@theme/components/XButton';
import { XInput } from '@theme/components/XInput';
import { XPage } from '@theme/components/XPage';

export const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await login(email, password);
    };

    return (
        <XPage title="Iniciar Sesión">
            <form onSubmit={handleSubmit}>
                <XInput
                    label="Correo Electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <XInput
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <XButton type="submit">Ingresar</XButton>
            </form>
        </XPage>
    );
};
```

2. **Página de No Encontrado (`NotFound.tsx`):**

```typescript
// src/presentation/pages/NotFound.tsx

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
                <h1>Esta página no existe</h1>
            </main>
        </div>
    );
};

export default NotFound;
```

### 2.9. `theme/`

**Ubicación:** `src/theme/`

#### Descripción

La carpeta `theme/` contiene el **sistema de diseño**, incluyendo estilos globales, temas y componentes estilizados.

#### Estructura
```plaintext
theme/
├── components/
│   ├── XButton.tsx
│   ├── XInput.tsx
│   └── XPage.tsx
├── globalStyles.ts
└── theme.ts
```

#### Ejemplos

1. **Componente de Botón (`XButton.tsx`):**

```typescript
// src/theme/components/XButton.tsx

import styled from 'styled-components';

export const XButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;
```

2. **Componente de Input (`XInput.tsx`):**

```typescript
// src/theme/components/XInput.tsx

import styled from 'styled-components';

export const XInput = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  width: 100%;
`;
```

3. **Componente de Página (`XPage.tsx`):**

```typescript
// src/theme/components/XPage.tsx

import React from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;

interface XPageProps {
  title: string;
  children: React.ReactNode;
}

export const XPage: React.FC<XPageProps> = ({ title, children }) => {
  return (
    <PageWrapper>
      <PageTitle>{title}</PageTitle>
      {children}
    </PageWrapper>
  );
};
```

4. **Estilos Globales (`globalStyles.ts`):**

```typescript
// src/theme/globalStyles.ts

import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }
`;
```

5. **Tema (`theme.ts`):**

```typescript
// src/theme/theme.ts

export const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
  },
};
```
