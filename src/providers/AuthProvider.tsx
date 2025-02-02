import { useAuthorizationUseCase } from '@application/auth/useAuthorizationUseCase';
import { useAuthorizationAPIClient } from '@infrastructure/api/useAuthorizationAPIClient';
import React, { createContext, ReactNode, useContext, ComponentType, useRef } from 'react';
import { usePreferencesStorage } from '@providers/withPreferencesStorageProvider';
import { useAxiosHTTPClient } from '@infrastructure/api/useAxiosHTTPClient';
import { IAuthorizationPort } from '@domain/ports/in/IAuthorizationPort';

const AuthProviderContext = createContext<IAuthorizationPort | null>(null);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const useAuthAPI = useRef(useAuthorizationAPIClient(useAxiosHTTPClient()))
    const useStorage = useRef(usePreferencesStorage())
    const useCases = useAuthorizationUseCase(useAuthAPI.current, useStorage.current)
    return (
        <AuthProviderContext.Provider value={useCases}>
            {children}
        </AuthProviderContext.Provider>
    );
};

export const withAuthProvider = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        return (
            <AuthProvider>
                <WrappedComponent {...props} />
            </AuthProvider>
        );
    };
};

export const withAuth = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const auth = useAuth();
        return <WrappedComponent {...props} auth={{ ...auth }} />;
    };
};


export const useAuth = (): IAuthorizationPort => {
    const context = useContext(AuthProviderContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};
