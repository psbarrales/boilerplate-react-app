import React, { PropsWithChildren } from 'react';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

export const WithReactQueryProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const queryClient = new QueryClient(
        {
            defaultOptions: {
                queries: {
                    retry: 1,
                    refetchOnWindowFocus: false,
                    staleTime: 1000 * 60 * 5, // 5 minutes
                },
                mutations: {
                    retry: false,
                },
            },
        }
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};
