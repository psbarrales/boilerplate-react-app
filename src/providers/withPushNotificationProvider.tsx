import React, { createContext, useContext, useState, useEffect, ComponentType, useRef, PropsWithChildren } from 'react';
import { PushNotificationsPort } from '@domain/ports/out/device/PushNotificationsPort';
import { useCapacitorPushNotificationsAdapter } from '@infrastructure/capacitor/usePushNotificationsAdapter';
import RequestPrompt from '@pages/RequestPrompt';

const PushNotificationsContext = createContext<PushNotificationsPort | null>(null);

export const WithPushNotificationsProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [initialized, setInitialized] = useState(false);
    const pushNotificationsService = useRef<PushNotificationsPort>(useCapacitorPushNotificationsAdapter());

    useEffect(() => {
        const loadConfig = async () => {
            await pushNotificationsService.current.checkPermissions()
            setInitialized(true);
        };

        loadConfig();
    }, []);

    if (!initialized || !pushNotificationsService.current) {
        return <PushNotificationsContext.Provider value={pushNotificationsService.current} >
            <RequestPrompt title='Permisos de notificación' message='Por favor, habilita las notificaciones para continuar.' />
            {children}
        </PushNotificationsContext.Provider>;
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
