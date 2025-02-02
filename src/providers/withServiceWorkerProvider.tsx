import React, { createContext, ReactNode, useEffect, useState } from "react";

const ServiceWorkerContext = createContext<boolean>(false);

export const withServiceWorkerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isServiceWorkerAvailable, setIsServiceWorkerAvailable] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            if (import.meta.env.VITE_ENVIRONMENT == "test") {
                setIsServiceWorkerAvailable(true);
                return
            }
            navigator.serviceWorker.register('/service-worker.js')
                .then(() => {
                    console.log('Service Worker registrado con éxito.');
                    setIsServiceWorkerAvailable(true);
                })
                .catch((error) => {
                    console.error('Error al registrar el Service Worker:', error);
                });
        } else {
            console.warn('Service Worker no está soportado en este navegador.');
            setIsServiceWorkerAvailable(false);
        }
    }, []);

    if (!isServiceWorkerAvailable) {
        return <div>Espere...</div>;
    }

    return (
        <ServiceWorkerContext.Provider value={isServiceWorkerAvailable}>
            {children}
        </ServiceWorkerContext.Provider>
    );
};

export const useServiceWorker = (): boolean => {
    const context = React.useContext(ServiceWorkerContext);
    if (context === undefined) {
        throw new Error("useServiceWorker debe ser usado dentro de withServiceWorkerProvider");
    }
    return context;
};
