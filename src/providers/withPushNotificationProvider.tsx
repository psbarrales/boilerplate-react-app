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
