import { ComponentType, createContext, ReactNode, useContext, useState } from 'react';

const ExampleSimpleContext = createContext<any | null>(null);

export const ExampleSimpleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [useCase, _] = useState()

    return (
        <ExampleSimpleContext.Provider value={useCase}>
            {children}
        </ExampleSimpleContext.Provider>
    );
};

export const withExampleSimple = <P extends object>(
    WrappedComponent: ComponentType<P>
): React.FC<P> => {
    return (props: P) => {
        const exampleSimple = useExampleSimple();
        return <WrappedComponent {...props} {...{ exampleSimple }
        } />;
    };
};

export const useExampleSimple = () => {
    const context = useContext(ExampleSimpleContext);
    if (!context) {
        throw new Error('useExampleSimple must be used within a ExampleSelectionProvider');
    }
    return context;
};
