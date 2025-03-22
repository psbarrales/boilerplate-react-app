import React, { PropsWithChildren } from 'react';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

// Initialize with Firebase Adapter
export const WithReactQueryProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const queryClient = new QueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};
