import { ComponentType, useRef } from 'react';
import { createProvider } from './createProvider';
import { useAuthorizationUseCase } from '@application/auth/useAuthorizationUseCase';
import { useAuthorizationAPIClient } from '@infrastructure/api/useAuthorizationAPIClient';
import { useAxiosHTTPClient } from '@infrastructure/api/useAxiosHTTPClient';
import { usePreferencesStorage } from '@providers/withPreferencesStorageProvider';

export const {
    Provider: AuthProvider,
    useProvider: useAuth,
    withProvider: withAuth,
} = createProvider('auth', () => {
    const authAPIRef = useRef(useAuthorizationAPIClient(useAxiosHTTPClient()));
    const storageRef = useRef(usePreferencesStorage());
    return useAuthorizationUseCase(authAPIRef.current, storageRef.current);
}, 'useAuth debe ser usado dentro de AuthProvider');

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
