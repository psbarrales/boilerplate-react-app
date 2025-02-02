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
