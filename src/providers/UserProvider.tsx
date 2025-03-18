import { ComponentType, useRef } from 'react';
import { createProvider } from './createProvider';
import { useUserUseCase } from '@application/user/useUserUseCase';
import { useAuth } from './AuthProvider';
import { useUserAPIClient } from '@infrastructure/api/useUserAPIClient';
import { useAuthorizedAxiosHTTPClient } from '@infrastructure/api/useAuthorizedAxiosHTTPClient';

export const {
    Provider: UserProvider,
    useProvider: useUser,
    withProvider: withUser,
} = createProvider('user', () => {
    const auth = useAuth();
    const userAPIRef = useRef(useUserAPIClient(useAuthorizedAxiosHTTPClient(auth)));
    return useUserUseCase(userAPIRef.current, auth);
}, 'useUser debe ser usado dentro de UserProvider');

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

export default UserProvider;
