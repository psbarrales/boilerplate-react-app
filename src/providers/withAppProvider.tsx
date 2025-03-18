import React, { createContext, useContext, useState, useEffect, ComponentType, useRef, PropsWithChildren } from 'react';
import { AppPort } from '@domain/ports/out/app/AppPort';
import { useAppAdapter } from '@infrastructure/capacitor/useAppAdapter';
import Fallback from '@pages/Fallback';

const AppContext = createContext<AppPort | null>(null);

// Initialize with Capacitor App Adapter
export const WithAppProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const appAdapter = useAppAdapter();
    const appServiceRef = useRef<AppPort | null>(appAdapter);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!appServiceRef.current) {
            appServiceRef.current = appAdapter;
        }
        setInitialized(true);
    }, [appAdapter]);

    if (!initialized || !appServiceRef.current) {
        return <Fallback />;
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
