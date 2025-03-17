## Arquitectura del Proyecto

El directorio `src/` es el núcleo de nuestra aplicación y sigue la **arquitectura hexagonal**, que promueve un código modular y desacoplado. A continuación, se detalla cada una de las subcarpetas dentro de `src/`, explicando su propósito y proporcionando ejemplos para facilitar su comprensión.

### Estructura General de `src/`

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

### **2.1. `domain/`**

**Ubicación:** `src/domain/`

#### **Descripción**

La carpeta `domain/` contiene la **lógica de negocio pura** de la aplicación. Aquí definimos:

- **Modelos (Entidades):** Representaciones de los objetos del dominio.
- **Puertos (Interfaces):** Contratos que definen cómo otras capas pueden interactuar con el dominio.

#### **Estructura**

```plaintext
domain/
├── models/
│   └── entities/
│       ├── IJwt.ts
│       ├── IJwtDecode.ts
│       └── IUser.ts
└── ports/
    ├── analytics/
    │   ├── AnalyticsService.ts
    │   └── ErrorTrackingService.ts
    ├── api/
    │   ├── APIClient.ts
    │   ├── AuthorizationAPI.ts
    │   ├── HTTPService.ts
    │   └── UserAPI.ts
    ├── app/
    │   ├── AppPort.ts
    │   ├── PreferencesStoragePort.ts
    │   └── RemoteConfigService.ts
    └── device/
        └── PushNotificationsPort.ts
```

#### **Ejemplos**

1. **Definición de una Entidad de Usuario (`IUser.ts`):**

```typescript
// src/domain/models/entities/IUser.ts

export interface IUser {
  id: string;
  name: string;
  email: string;
}
```

2. **Definición de un Puerto de Autorización (`AuthorizationAPI.ts`):**

```typescript
// src/domain/ports/api/AuthorizationAPI.ts

import { IUser } from '../../models/entities/IUser';

export interface IAuthorizationAPI {
  login(email: string, password: string): Promise<IUser>;
  logout(): Promise<void>;
}
```

---

### **2.2. `application/`**

**Ubicación:** `src/application/`

#### **Descripción**

La carpeta `application/` contiene los **casos de uso** de la aplicación, implementados como **hooks** de React. Estos casos de uso utilizan los puertos y modelos definidos en el dominio.

#### **Estructura**

```plaintext
application/
├── auth/
│   └── useAuthorizationUseCase.ts
└── user/
    └── useUserUseCase.ts
```

#### **Ejemplos**

1. **Caso de Uso de Autorización (`useAuthorizationUseCase.ts`):**

```typescript
// src/application/auth/useAuthorizationUseCase.ts

import { useState } from 'react';
import { IAuthorizationAPI } from '../../domain/ports/api/AuthorizationAPI';
import { IUser } from '../../domain/models/entities/IUser';

export const useAuthorizationUseCase = (authAPI: IAuthorizationAPI) => {
  const [user, setUser] = useState<IUser | null>(null);

  const login = async (email: string, password: string) => {
    const loggedInUser = await authAPI.login(email, password);
    setUser(loggedInUser);
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  return { user, login, logout };
};
```

---

### **2.3. `infrastructure/`**

**Ubicación:** `src/infrastructure/`

#### **Descripción**

La carpeta `infrastructure/` contiene las **implementaciones concretas** de los puertos definidos en el dominio. Aquí es donde se conecta la aplicación con tecnologías y servicios externos, como APIs y almacenamiento.

#### **Estructura**

```plaintext
infrastructure/
├── api/
│   ├── FetchHTTPClient.ts
│   ├── useAuthorizationAPIClient.ts
│   ├── useAxiosHTTPClient.ts
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

#### **Ejemplos**

1. **Implementación de `IAuthorizationAPI` con Axios (`useAuthorizationAPIClient.ts`):**

```typescript
// src/infrastructure/api/useAuthorizationAPIClient.ts

import axios from 'axios';
import { IAuthorizationAPI } from '../../domain/ports/api/AuthorizationAPI';
import { IUser } from '../../domain/models/entities/IUser';

export const useAuthorizationAPIClient = (): IAuthorizationAPI => {
  const login = async (email: string, password: string): Promise<IUser> => {
    const response = await axios.post('/api/login', { email, password });
    return response.data as IUser;
  };

  const logout = async (): Promise<void> => {
    await axios.post('/api/logout');
  };

  return { login, logout };
};
```

2. **Adaptador de Almacenamiento de Preferencias con Capacitor (`useCapacitorPreferencesStorageAdapter.ts`):**

```typescript
// src/infrastructure/capacitor/useCapacitorPreferencesStorageAdapter.ts

import { Preferences } from '@capacitor/preferences';
import { PreferencesStoragePort } from '../../domain/ports/app/PreferencesStoragePort';

export const useCapacitorPreferencesStorageAdapter =
  (): PreferencesStoragePort => {
    const setItem = async (key: string, value: string) => {
      await Preferences.set({ key, value });
    };

    const getItem = async (key: string): Promise<string | null> => {
      const result = await Preferences.get({ key });
      return result.value;
    };

    const removeItem = async (key: string) => {
      await Preferences.remove({ key });
    };

    return { setItem, getItem, removeItem };
  };
```

---

### **2.4. `providers/`**

**Ubicación:** `src/providers/`

#### **Descripción**

Los **Providers** son responsables de inyectar las dependencias y proporcionar los contextos necesarios a los componentes de la aplicación. Utilizan el Context API de React y pueden envolver componentes con los adaptadores de infraestructura necesarios.

#### **Estructura**

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

#### **Ejemplos**

1. **`AuthProvider.tsx`:**

```typescript
// src/providers/AuthProvider.tsx

import React, { createContext, ReactNode, useContext } from 'react';
import { useAuthorizationUseCase } from '../application/auth/useAuthorizationUseCase';
import { useAuthorizationAPIClient } from '../infrastructure/api/useAuthorizationAPIClient';
import { IUser } from '../domain/models/entities/IUser';

interface AuthContextProps {
  user: IUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authAPI = useAuthorizationAPIClient();
  const { user, login, logout } = useAuthorizationUseCase(authAPI);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

2. **`composeProvider.tsx`:**

```typescript
// src/providers/composeProvider.tsx

import React, { ReactNode } from 'react';

type ProviderProps = {
  children: ReactNode;
};

export const composeProvider = (
  ...providers: React.ComponentType<ProviderProps>[]
) => {
  return providers.reduce(
    (AccumulatedProviders, CurrentProvider) => {
      return ({ children }: ProviderProps) => (
        <AccumulatedProviders>
          <CurrentProvider>{children}</CurrentProvider>
        </AccumulatedProviders>
      );
    },
    ({ children }) => <>{children}</>
  );
};
```

---

### **2.5. `presentation/`**

**Ubicación:** `src/presentation/`

#### **Descripción**

La carpeta `presentation/` contiene las **páginas** y **componentes** de la interfaz de usuario. Aquí se construye la vista utilizando los componentes de UI y estilos necesarios para interactuar con el usuario.

#### **Estructura**

```plaintext
presentation/
├── components/
├── layout/
└── pages/
    ├── Home/
    │   ├── Home.tsx
    │   └── MallSelection.tsx
    ├── NotImplemented.tsx
    ├── Notification/
    │   └── Notifications.tsx
    ├── OnBoarding.tsx
    ├── Profile/
    │   └── Profile.tsx
    └── Register/
        └── Login.tsx
```

#### **Ejemplos**

1. **Página de Login (`Login.tsx`):**

```typescript
// src/presentation/pages/Register/Login.tsx

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

2. **Componente `XInput` (`XInput.tsx`):**

```typescript
// src/theme/components/XInput.tsx

import React from 'react';
import styled from 'styled-components';

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
  border: 1px solid #ccc;
`;

export const XInput: React.FC<XInputProps> = ({ label, ...props }) => (
  <InputWrapper>
    <Label>{label}</Label>
    <StyledInput {...props} />
  </InputWrapper>
);
```

---

### **2.6. `theme/`**

**Ubicación:** `src/theme/`

#### **Descripción**

La carpeta `theme/` contiene el **sistema de diseño**, incluyendo estilos globales, temas y componentes estilizados.

#### **Estructura**

```plaintext
theme/
├── GlobalStyles.ts
├── IonicGlobalStyles.ts
├── components/
│   ├── PageLoading.tsx
│   ├── XButton.tsx
│   ├── XInput.tsx
│   ├── XPage.tsx
│   ├── XTitle.tsx
│   ├── XToolbar.tsx
│   └── index.ts
├── icons/
├── styles/
│   ├── ionic-styles.ts
│   └── variables.css
├── themes/
│   └── defaultTheme.ts
└── tokens/
    ├── colors.ts
    └── spacing.ts
```

#### **Ejemplos**

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

### **2.7. `routes/`**

**Ubicación:** `src/routes/`

#### **Descripción**

La carpeta `routes/` gestiona la configuración de las **rutas** y la **navegación** de la aplicación.

#### **Estructura**

```plaintext
routes/
└── index.tsx
```

#### **Ejemplos**

1. **Configuración de Rutas (`index.tsx`):**

```typescript
// src/routes/index.tsx

import React from 'react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { Home } from '../presentation/pages/Home/Home';
import { Login } from '../presentation/pages/Register/Login';
import { useAuth } from '../providers/AuthProvider';

export const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <IonReactRouter>
      {user ? (
        <>
          <Route exact path="/home" component={Home} />
          <Redirect to="/home" />
        </>
      ) : (
        <>
          <Route exact path="/login" component={Login} />
          <Redirect to="/login" />
        </>
      )}
    </IonReactRouter>
  );
};
```

---

### **2.8. `hooks/`**

**Ubicación:** `src/hooks/`

#### **Descripción**

La carpeta `hooks/` contiene **hooks reutilizables** que pueden ser utilizados en diferentes partes de la aplicación.

#### **Ejemplos**

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

### **2.9. `__test__/`**

**Ubicación:** `src/__test__/`

#### **Descripción**

La carpeta `__test__/` contiene las **pruebas unitarias** y de integración para los componentes y lógica de la aplicación.

#### **Estructura**

```plaintext
__test__/
├── App.test.tsx
└── application/
    └── auth/
```

#### **Ejemplos**

1. **Prueba Unitaria para el Componente `XButton` (`XButton.test.tsx`):**

```typescript
// src/__test__/theme/components/XButton.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { XButton } from '../../../theme/components/XButton';

test('XButton renders correctly and handles clicks', () => {
  const handleClick = jest.fn();
  const { getByText } = render(
    <XButton onClick={handleClick}>Click Me</XButton>
  );

  const button = getByText('Click Me');
  fireEvent.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

### **2.10. `App.tsx` y `main.tsx`**

#### **Descripción**

Estos archivos son el punto de entrada de la aplicación.

1. **`App.tsx`:** Componente raíz que envuelve la aplicación con los providers necesarios.

```typescript
// src/App.tsx

import React from 'react';
import { IonApp } from '@ionic/react';
import { composeProvider } from './providers/composeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { AppRoutes } from './routes';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from './theme/themes/defaultTheme';
import { GlobalStyles } from './theme/GlobalStyles';

const Providers = composeProvider(AuthProvider);

const App = () => (
  <IonApp>
    <Providers>
      <ThemeProvider theme={defaultTheme}>
        <GlobalStyles />
        <AppRoutes />
      </ThemeProvider>
    </Providers>
  </IonApp>
);

export default App;
```

2. **`main.tsx`:** Renderiza la aplicación en el DOM.

```typescript
// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { setupIonicReact } from '@ionic/react';

setupIonicReact();

ReactDOM.render(<App />, document.getElementById('root'));
```

---

Al comprender esta estructura y cómo interactúan las diferentes carpetas y componentes, podrás navegar y contribuir al proyecto de manera efectiva. Cada capa tiene responsabilidades claras, y los ejemplos proporcionados ilustran cómo se implementan estas responsabilidades en el código.
