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
