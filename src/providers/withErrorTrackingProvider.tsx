import React, { createContext, ReactNode, useContext, useState, useEffect, ComponentType, useRef } from "react";
import { ErrorTrackingPort } from "@domain/ports/out/analytics/ErrorTrackingPort";
import { useFirebaseErrorTrackingAdapter } from "@infrastructure/firebase/useFirebaseErrorTrackingAdapter";

const ErrorTrackingContext = createContext<ErrorTrackingPort | null>(null);

// Inicializa el servicio con Firebase Adapter
const createFirebaseErrorTrackingService = (): ErrorTrackingPort => {
    return useFirebaseErrorTrackingAdapter();
};

export const withErrorTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const errorTrackingService = useRef<ErrorTrackingPort>(createFirebaseErrorTrackingService());
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const initializeErrorTracking = async () => {
            setInitialized(true);
            // window.onerror = (message, source, lineno, colno, error) => {
            //     try {
            //         errorTrackingService.current.recordError(JSON.stringify(error));
            //     } catch (err) {
            //         console.warn("Error al registrar el error:", err);
            //     }
            //     return true;
            // };

            // window.addEventListener("unhandledrejection", (event) => {
            //     try {
            //         if (event.reason) errorTrackingService.current.recordError(JSON.stringify(event.reason));
            //     } catch (err) {
            //         console.warn("Error al registrar el rechazo:", err);
            //     }
            //     event.preventDefault();
            // });
        };

        initializeErrorTracking();
    }, []);

    if (!initialized || !errorTrackingService.current) {
        return <div>Espere...</div>;
    }

    return (
        <ErrorTrackingContext.Provider value={errorTrackingService.current}>
            {children}
        </ErrorTrackingContext.Provider>
    );
};

export const withErrorTracking = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const errorTracking = useErrorTracking();
        return <WrappedComponent {...props} errorTracking={errorTracking} />;
    };
};

export const useErrorTracking = (): ErrorTrackingPort => {
    const context = useContext(ErrorTrackingContext);
    if (!context) {
        throw new Error("useErrorTracking debe ser usado dentro de withErrorTrackingProvider");
    }
    return context;
};
