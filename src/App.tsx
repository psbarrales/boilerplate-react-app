import { composeProviders } from '@providers/composeProvider';
import { withBooting } from '@providers/withBooting';
import { AuthProvider } from '@providers/AuthProvider';
import { RouterProvider } from 'react-router-dom';
import { UserProvider } from '@providers/UserProvider';
import router from '@routes/index'
import React, { ReactNode } from 'react';

const withAutorization = (children: ReactNode) => {
    const Providers = React.useMemo(
        () => composeProviders(AuthProvider, UserProvider),
        []
    );

    return <Providers>{children}</Providers>;
};

const App: React.FC = React.memo(() => withBooting(
    withAutorization(
        <RouterProvider router={router} />
    )
));

export default App;
