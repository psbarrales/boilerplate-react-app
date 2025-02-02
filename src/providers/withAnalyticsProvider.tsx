import React, {
    createContext,
    ReactNode,
    useContext,
    useState,
    ComponentType,
    useRef,
} from 'react';
import { AnalyticsPort } from '@domain/ports/out/analytics/AnalyticsPort';
import { useFirebaseAnalyticsAdapter } from '@infrastructure/firebase/useFirebaseAnalyticsAdapter';

const AnalyticsContext = createContext<AnalyticsPort | null>(null);

const createFirebaseAnalyticsService = (): AnalyticsPort => {
    return useFirebaseAnalyticsAdapter();
};

export const withAnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const analyticsServiceRef = useRef<AnalyticsPort | null>(null);
    const [initialized, setInitialized] = useState(false);


    if (!analyticsServiceRef.current) {
        analyticsServiceRef.current = createFirebaseAnalyticsService();
        setInitialized(true)
    }

    if (!initialized || !analyticsServiceRef.current) {
        return <div>Espere...</div>;
    }

    return (
        <AnalyticsContext.Provider value={analyticsServiceRef.current}>
            {children}
        </AnalyticsContext.Provider>
    );
};


export const withAnalytics = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const analytics = useAnalytics();
        return <WrappedComponent {...props} analytics={analytics} />;
    };
};

export const useAnalytics = (): AnalyticsPort => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics debe ser usado dentro de withAnalyticsProvider');
    }
    return context;
};
