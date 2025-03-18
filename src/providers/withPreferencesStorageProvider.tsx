import React, { createContext, useContext, useState, useEffect, ComponentType, PropsWithChildren, useRef } from 'react';
import { PreferencesStoragePort } from '@domain/ports/out/app/PreferencesStoragePort';
import { useCapacitorPreferencesStorageAdapter } from '@infrastructure/capacitor/useCapacitorPreferencesStorageAdapter';
import Fallback from '@pages/Fallback';

const PreferencesStorageContext = createContext<PreferencesStoragePort | null>(null);

export const WithPreferencesStorageProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const capacitorAdapter = useRef(useCapacitorPreferencesStorageAdapter());
    const [preferencesStorageService, setPreferencesStorageService] = useState<PreferencesStoragePort | undefined>();

    useEffect(() => {
        const loadConfig = async () => {
            setPreferencesStorageService(capacitorAdapter.current)
        };

        loadConfig();
    }, [capacitorAdapter]);

    if (!preferencesStorageService) {
        return <Fallback />;
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
