import React, {
    createContext,
    useContext,
    useState,
    ComponentType,
    useRef,
    PropsWithChildren,
} from 'react';
import { AnalyticsPort } from '@domain/ports/out/analytics/AnalyticsPort';
import { useFirebaseAnalyticsAdapter } from '@infrastructure/firebase/useFirebaseAnalyticsAdapter';
import Fallback from '@pages/Fallback';

const AnalyticsContext = createContext<AnalyticsPort | null>(null);

export const WithAnalyticsProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const analyticsServiceRef = useRef<AnalyticsPort | null>(null);
    const [initialized, setInitialized] = useState(false);
    const firebaseAnalytics = useFirebaseAnalyticsAdapter();

    if (!analyticsServiceRef.current) {
        analyticsServiceRef.current = firebaseAnalytics;
        setInitialized(true)
    }

    if (!initialized || !analyticsServiceRef.current) {
        return <Fallback />;
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
