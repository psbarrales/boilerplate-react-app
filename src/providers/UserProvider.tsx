import React, { createContext, ReactNode, useContext, ComponentType, useRef } from 'react';
import { usePreferencesStorage } from '@providers/withPreferencesStorageProvider';
import { useUserUseCase } from '@application/user/useUserUseCase';
import { useAuth } from './AuthProvider';
import { useUserAPIClient } from '@infrastructure/api/useUserAPIClient';
import { IUserPort } from '@domain/ports/in/IUserPort';
import { useAuthorizedAxiosHTTPClient } from '@infrastructure/api/useAuthorizedAxiosHTTPClient';

const UserProviderContext = createContext<IUserPort | null>(null);


export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth()
    const useUserAPI = useRef(useUserAPIClient(useAuthorizedAxiosHTTPClient(auth)))
    const useStorage = useRef(usePreferencesStorage())
    const useCases = useUserUseCase(useUserAPI.current, auth, useStorage.current)

    return (
        <UserProviderContext.Provider value={useCases}>
            {children}
        </UserProviderContext.Provider>
    );
};

export const withUserProvider = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        return (
            <UserProvider>
                <WrappedComponent {...props} />
            </UserProvider>
        );
    };
};

export const withUser = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const user = useUser();
        return <WrappedComponent {...props} user={{ ...user }} />;
    };
};


export const useUser = () => {
    const context = useContext(UserProviderContext);
    if (!context) {
        throw new Error('useUser debe ser usado dentro de UserProvider');
    }
    return context;
};
