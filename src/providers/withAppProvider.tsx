import React, { createContext, useContext, useState, useEffect, ComponentType, useRef, PropsWithChildren } from 'react';
import { AppPort } from '@domain/ports/out/app/AppPort';
import { useAppAdapter } from '@infrastructure/capacitor/useAppAdapter';
import RequestPrompt from '@pages/RequestPrompt';

const AppContext = createContext<AppPort | null>(null);

// Initialize with App Adapter for web environment
export const WithAppProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const appAdapter = useAppAdapter();
    const appServiceRef = useRef<AppPort | null>(appAdapter);
    const [initialized, setInitialized] = useState(false);
    const [isConnected, setIsConnected] = useState(navigator.onLine);

    useEffect(() => {
        // Inicializar el servicio de la app
        if (!appServiceRef.current) {
            appServiceRef.current = appAdapter;
        }
        setInitialized(true);

        // Añadir event listeners para detectar cambios en la conexión
        const handleOnline = () => setIsConnected(true);
        const handleOffline = () => setIsConnected(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Limpiar los event listeners cuando se desmonte el componente
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [appAdapter]);

    // Mostrar el Fallback si no hay conexión o el servicio no está inicializado
    if (!initialized || !appServiceRef.current || !isConnected) {
        return <AppContext.Provider value={appServiceRef.current}>
            <RequestPrompt title='No hay conexión a internet' message='Por favor, verifica tu conexión y vuelve a intentarlo.' />
            {children}
        </AppContext.Provider>
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
