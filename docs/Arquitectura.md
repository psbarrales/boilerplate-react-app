Claro, vamos a actualizar el documento `Arquitectura.md` utilizando la información proporcionada. Aquí tienes una versión detallada del archivo `Arquitectura.md` para el proyecto `boilerplate-app`, basada en la estructura y el código facilitado.

## Arquitectura del Proyecto `boilerplate-app`

El directorio `src/` es el núcleo de nuestra aplicación y sigue la **arquitectura hexagonal**, que promueve un código modular y desacoplado. A continuación, se detalla cada una de las subcarpetas dentro de `src/`, explicando su propósito y proporcionando ejemplos para facilitar su comprensión.

### Estructura General de `src/`

```plaintext
src/
├── App.tsx
├── __test__/
├── application/
├── assets/
├── domain/
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

### 2.1. `domain/`

**Ubicación:** `src/domain/`

#### Descripción

La carpeta `domain/` contiene la **lógica de negocio pura** de la aplicación. Aquí definimos:

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
    │   ├── APIClient.ts
    │   ├── AuthorizationServicePort.ts
    │   └── UserServicePort.ts
    ├── device/
    └── in/
        ├── IAuthorizationPort.ts
        └── IUserPort.ts
```

#### Ejemplos

1. **Definición de una Entidad de Usuario (`IUser.ts`):**

```typescript
// src/domain/models/entities/IUser.ts

export interface IUser {
    id: string;
    email: string;
    full_name: string;
    avatar?: string;
}

export type IUserRole = 'INVITED' | 'USER' | 'ADMIN' | 'INVALID'
```

2. **Definición de un Puerto de Autorización (`AuthorizationServicePort.ts`):**

```typescript
// src/domain/ports/out/api/AuthorizationServicePort.ts

import { IJwt } from "@domain/models/entities/IJwt";

export interface AuthorizationServicePort {
    login(user: string, pass: string): Promise<IJwt>;
    logout(): Promise<void>;
}
```

---

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
```

---

### 2.3. `infrastructure/`

**Ubicación:** `src/infrastructure/`

#### Descripción

La carpeta `infrastructure/` contiene las **implementaciones concretas** de los puertos definidos en el dominio. Aquí es donde se conecta la aplicación con tecnologías y servicios externos, como APIs y almacenamiento.

#### Estructura

```plaintext
infrastructure/
├── api/
│   ├── useAuthorizedAxiosHTTPClient.ts
│   ├── useAxiosHTTPClient.ts
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

1. **Implementación de `IAuthorizationServicePort` con Axios (`useAuthorizationAPIClient.ts`):**

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
```

2. **Adaptador de Almacenamiento de Preferencias con Capacitor (`useCapacitorPreferencesStorageAdapter.ts`):**

```typescript
// src/infrastructure/capacitor/useCapacitorPreferencesStorageAdapter.ts

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

---

### 2.4. `providers/`

**Ubicación:** `src/providers/`

#### Descripción

Los **Providers** son responsables de inyectar las dependencias y proporcionar los contextos necesarios a los componentes de la aplicación. Utilizan el Context API de React y pueden envolver componentes con los adaptadores de infraestructura necesarios.

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

import React, { createContext, useContext, useState, useEffect, ComponentType, useRef, PropsWithChildren } from 'react';
import { useAuthorizationUseCase } from '../application/auth/useAuthorizationUseCase';
import { useAuthorizationAPIClient } from '../infrastructure/api/useAuthorizationAPIClient';
import { useAxiosHTTPClient } from '../infrastructure/api/useAxiosHTTPClient';
import { usePreferencesStorage } from '@providers/withPreferencesStorageProvider';

export const {
    Provider: AuthProvider,
    useProvider: useAuth,
    withProvider: withAuth,
} = createProvider('auth', () => {
    const authAPIRef = useRef(useAuthorizationAPIClient(useAxiosHTTPClient()));
    const storageRef = useRef(usePreferencesStorage());
    return useAuthorizationUseCase(authAPIRef.current, storageRef.current);
}, 'useAuth debe ser usado dentro de AuthProvider');
```

2. **`composeProvider.tsx`:**

```typescript
// src/providers/composeProvider.tsx

import React, { ReactNode } from 'react';

const composeProvider =
    (...providers: Array<React.FC<{ children: ReactNode }>>) =>
        ({ children }: { children: ReactNode }) =>
            providers.reduceRight(
                (acc, Provider) => <Provider>{acc}</Provider>,
                children
            );

export { composeProvider };
```

---

### 2.5. `presentation/`

**Ubicación:** `src/presentation/`

#### Descripción

La carpeta `presentation/` contiene las **páginas** y **componentes** de la interfaz de usuario. Aquí se construye la vista utilizando los componentes de UI y estilos necesarios para interactuar con el usuario.

#### Estructura

```plaintext
presentation/
├── pages/
│   ├── Home/
│   │   └── Home.tsx
│   ├── VersionUpdatePrompt.tsx
│   ├── NotFound.tsx
│   ├── Fallback.tsx
│   ├── NotImplemented.tsx
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   └── App/
│       └── AppRoutes.tsx
├── components/
│   ├── Header.tsx
│   └── Footer.tsx
└── assets/
    ├── icon/
    │   ├── app-icon.png
    │   └── favicon.png
```

#### Ejemplos

1. **Página de Login (`Login.tsx`):**

```typescript
// src/presentation/pages/Auth/Login.tsx

import React, { useState } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { XButton } from '../../../theme/components/XButton';
import { XInput } from '../../../theme/components/XInput';
import { XPage } from '../../../theme/components/XPage';

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

---

### 2.6. `routes/`

**Ubicación:** `src/routes/`

#### Descripción

La carpeta `routes/` gestiona la configuración de las **rutas** y la **navegación** de la aplicación.

#### Estructura

```plaintext
routes/
├── index.tsx
├── auth.tsx
└── app.tsx
```

#### Ejemplos

1. **Configuración de Rutas (`index.tsx`):**

```typescript
// src/routes/index.tsx

import {
    createBrowserRouter,
    Navigate,
} from "react-router-dom";
import NotFound from "@pages/NotFound";
import { PublicRoute } from "@routes/routeGuards";
import auth from "./auth";
import app from "./app";
import NotImplemented from "@pages/NotImplemented";
import VersionUpdatePrompt from "@pages/VersionUpdatePrompt";

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
                path: "update",
                element: <VersionUpdatePrompt />
            },
            {
                path: "debug",
                element: <NotImplemented />
            },
            ...auth,
            ...app
        ]
    },
]);

export default router
```

2. **Definición de Rutas Públicas (`PublicRoute.tsx`):**

```typescript
// src/routes/routeGuards.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@providers/AuthProvider";

export const PublicRoute = ({ component, children }: { component?: React.ReactNode; children?: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app/home" replace />;
  }

  return (
    <>
      {component ?? children}
    </>
  );
};
```

---

### 2.7. `theme/`

**Ubicación:** `src/theme/`

#### Descripción

La carpeta `theme/` contiene el **sistema de diseño**, incluyendo estilos globales, temas y componentes estilizados.

#### Estructura

```plaintext
theme/
├── GlobalStyles.ts
├── FrameworkGlobalStyles.ts
├── components/
│   ├── XButton.tsx
│   ├── XInput.tsx
│   ├── XPage.tsx
│   └── XTitle.tsx
├── styles/
│   ├── variables.css
│   ├── ionic-styles.ts
├── themes/
│   └── defaultTheme.ts
└── tokens/
    ├── colors.ts
    └── spacing.ts
```

#### Ejemplos

1. **Definición de Tokens de Colores (`colors.ts`):**

```typescript
// src/theme/tokens/colors.ts

export const colors = {
  primary: '#007bff',
  secondary: '#6c757d',
  success: '#28a745',
  danger: '#dc3545',
  // Otros colores
};
```

2. **Componente `XButton` en `theme/components` (`XButton.tsx`):**

```typescript
// src/theme/components/XButton.tsx

import React from 'react';
import styled from 'styled-components';
import { colors } from '../tokens/colors';

interface XButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const StyledButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  background-color: ${(props) =>
    props.variant === 'primary' ? colors.primary : colors.secondary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

export const XButton: React.FC<XButtonProps> = ({
  variant = 'primary',
  children,
  ...props
}) => (
  <StyledButton variant={variant} {...props}>
    {children}
  </StyledButton>
);
```

---

### 2.8. `infrastructure/`

**Ubicación:** `src/infrastructure/`

#### Descripción

La carpeta `infrastructure/` contiene las **implementaciones concretas** de los puertos definidos en el dominio. Aquí es donde se conecta la aplicación con tecnologías y servicios externos, como APIs y almacenamiento.

#### Estructura

```plaintext
infrastructure/
├── api/
│   ├── useAuthorizedAxiosHTTPClient.ts
│   ├── useAxiosHTTPClient.ts
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

1. **Implementación de `IAuthorizationServicePort` con Axios (`useAuthorizationAPIClient.ts`):**

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
```

2. **Adaptador de Almacenamiento de Preferencias con Capacitor (`useCapacitorPreferencesStorageAdapter.ts`):**

```typescript
// src/infrastructure/capacitor/useCapacitorPreferencesStorageAdapter.ts

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

---

### 2.9. `__test__/`

**Ubicación:** `src/__test__/`

#### Descripción

La carpeta `__test__/` contiene las **pruebas unitarias** y de integración para los componentes y lógica de la aplicación.

#### Estructura

```plaintext
__test__/
├── App.test.tsx
└── application/
    └── auth/
        └── useAuthorizationUseCase.test.tsx
```

#### Ejemplos

1. **Prueba Unitaria para el Caso de Uso de Autorización (`useAuthorizationUseCase.test.tsx`):**

```typescript
// src/__test__/application/auth/useAuthorizationUseCase.test.tsx

import { renderHook, act } from '@testing-library/react-hooks';
import { useAuthorizationUseCase } from '@application/auth/useAuthorizationUseCase';

test('Debe iniciar sesión y actualizar el token', async () => {
  const mockApi = {
    login: jest.fn().mockResolvedValue({ access_token: 'mockToken', expires_in: 3600, token_type: 'Bearer' }),
    logout: jest.fn()
  };
  const mockStorage = {
    set: jest.fn(),
    get: jest.fn().mockResolvedValue(null),
    remove: jest.fn()
  };

  const { result } = renderHook(() => useAuthorizationUseCase(mockApi, mockStorage));

  await act(async () => {
    await result.current.login('user@example.com', 'password123');
  });

  expect(mockApi.login).toHaveBeenCalledWith('user@example.com', 'password123');
  expect(mockStorage.set).toHaveBeenCalledWith('@token', 'mockToken');
});
```

---

### 2.10. `App.tsx` y `main.tsx`

#### Descripción

Estos archivos son el punto de entrada de la aplicación.

1. **`App.tsx`:** Componente raíz que envuelve la aplicación con los providers necesarios.

```typescript
// src/App.tsx

import React from 'react';
import { composeProviders } from '@providers/composeProvider';
import { WithAnalyticsProvider } from '@providers/withAnalyticsProvider';
import { WithAppProvider } from '@providers/withAppProvider';
import { WithErrorTrackingProvider } from '@providers/withErrorTrackingProvider';
import { WithPreferencesStorageProvider } from '@providers/withPreferencesStorageProvider';
import { WithPushNotificationsProvider } from '@providers/withPushNotificationProvider';
import { WithRemoteConfigProvider } from '@providers/withRemoteConfigProvider';
import { WithBooting } from '@providers/withBooting';
import { AppRoutes } from './routes';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { defaultTheme } from './theme/themes/defaultTheme';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${defaultTheme.colors.background};
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
  }
`;

const Providers = composeProviders(
  // withServiceWorkerProvider,
  WithAppProvider,
  WithRemoteConfigProvider,
  WithAnalyticsProvider,
  WithErrorTrackingProvider,
  WithPushNotificationsProvider,
  WithPreferencesStorageProvider,
);

const App = () => (
  <Providers>
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyle />
      <AppRoutes />
    </ThemeProvider>
  </Providers>
);

export default App;
```

2. **`main.tsx`:** Renderiza la aplicación en el DOM.

```typescript
// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom';
import { router } from './routes';
import { RouterProvider } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById('root')
);
```

---

### 2.11. `hooks/`

**Ubicación:** `src/hooks/`

#### Descripción

La carpeta `hooks/` contiene **hooks reutilizables** que pueden ser utilizados en diferentes partes de la aplicación.

#### Ejemplos

1. **Hook para Manejar el Estado de Carga (`useLoading.ts`):**

```typescript
// src/hooks/useLoading.ts

import { useState } from 'react';

export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const finishLoading = () => setIsLoading(false);

  return { isLoading, startLoading, finishLoading };
};
```

---

### 2.12. `assets/`

**Ubicación:** `src/assets/`

#### Descripción

La carpeta `assets/` contiene recursos estáticos utilizados en la aplicación, como imágenes, fuentes y otros archivos multimedia.

#### Ejemplos

1. **Icono de la Aplicación (`app-icon.png`):**

```plaintext
assets/
└── icon/
    ├── app-icon.png
    └── favicon.png
```

---

### 2.13. `setupTests.ts`

**Ubicación:** `src/setupTests.ts`

#### Descripción

El archivo `setupTests.ts` se utiliza para configurar las pruebas globales, como la configuración de mocks y setup de bibliotecas de pruebas.

#### Ejemplos

1. **Configuración de Pruebas con `setupTests.ts`:**

```typescript
// src/setupTests.ts

import '@testing-library/jest-dom/extend-expect';
import { ToBooleanAttribute } from '@babel/types';
import { TextMatch } from '@testing-library/react';
import { MatchOptions } from '@testing-library/react';

process.env.API_ENDPOINT = "http://localhost:3000";
```

---

Al comprender esta estructura y cómo interactúan las diferentes carpetas y componentes, podrás navegar y contribuir al proyecto de manera efectiva. Cada capa tiene responsabilidades claras, y los ejemplos proporcionados ilustran cómo se implementan estas responsabilidades en el código.

---

### 2.14. `App.tsx` y `main.tsx`

**Ubicación:** `src/`

#### Descripción

Estos archivos son los puntos de entrada de la aplicación.

1. **`App.tsx`:** Componente raíz que envuelve la aplicación con los providers necesarios.

```typescript
// src/App.tsx

import React from 'react';
import { FrameworkProvider } from '@providers/FrameworkProvider';
import { WithBooting } from '@providers/withBooting';
import { useAuth } from '@providers/AuthProvider';
import { router } from './routes';
import { RouterProvider } from 'react-router-dom';

const App = () => {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <FrameworkProvider>
      <WithBooting>
        <RouterProvider router={router} />
      </WithBooting>
    </FrameworkProvider>
  );
};

export default App;
```

2. **`main.tsx`:** Renderiza la aplicación en el DOM.

```typescript
// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

---

### 2.15. `theme/`

**Ubicación:** `src/theme/`

#### Descripción

La carpeta `theme/` contiene el **sistema de diseño**, incluyendo estilos globales, temas y componentes estilizados.

#### Estructura

```plaintext
theme/
├── GlobalStyles.ts
├── FrameworkGlobalStyles.ts
├── components/
│   ├── Index.tsx
│   ├── XButton.tsx
│   ├── XInput.tsx
│   ├── XPage.tsx
│   ├── XTitle.tsx
│   └── XToolbar.tsx
├── icons/
├── styles/
│   ├── variables.css
│   └── ionic-styles.ts
├── themes/
│   └── defaultTheme.ts
└── tokens/
    ├── colors.ts
    └── spacing.ts
```

#### Ejemplos

1. **Definición de un Componente Estilizado (`XInput.tsx`):**

```typescript
// src/theme/components/XInput.tsx

import React from 'react';
import styled from 'styled-components';
import { colors } from '../../tokens/colors';

interface XInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputWrapper = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid ${colors.gray};
  border-radius: 4px;
`;

export const XInput: React.FC<XInputProps> = ({ label, ...props }) => (
  <InputWrapper>
    <Label>{label}</Label>
    <StyledInput {...props} />
  </InputWrapper>
);
```

2. **Estilos Globales (`GlobalStyles.ts`):**

```typescript
// src/theme/GlobalStyles.ts

import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f8f9fa;
  }
`;

export default GlobalStyles;
```

---

### **Resumen**

El proyecto `boilerplate-app` está organizado en capas que cumplen roles específicos en la arquitectura:

- **`domain/`:** Contiene la lógica de negocio y definiciones de entidades.
- **`application/`:** Implementa los casos de uso utilizando hooks de React.
- **`infrastructure/`:** Implementa los puertos con tecnologías externas, como Axios y Firebase.
- **`providers/`:** Proporciona contextos y dependencias a los componentes de presentación.
- **`presentation/`:** Contiene componentes y páginas de la interfaz de usuario.
- **`hooks/`:** Almacena hooks reutilizables para diferentes partes de la aplicación.
- **`__test__/`:** Contiene pruebas unitarias y de integración.
- **`theme/`:** Define los estilos y componentes estilizados de la aplicación.

Cada capa tiene su propia responsabilidad a fin de mantener el código modular y desacoplado, facilitando la gestión y escalabilidad del proyecto.

---