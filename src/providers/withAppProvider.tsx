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
