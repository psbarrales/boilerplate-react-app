import React, { createContext, useContext, ComponentType, PropsWithChildren } from "react";

export function createProvider<T, P = object>(valueName: string, factory: (props: P) => T, errorMessage: string) {
    const Context = createContext<T | undefined>(undefined);

    const Provider: React.FC<Partial<PropsWithChildren<P>>> = ({ children, ...props }) => {
        const value = factory(props as P);
        return (
            <Context.Provider value={value}>
                {children}
            </Context.Provider>
        );
    };
    // Agregar displayName al Provider usando valueName
    Provider.displayName = `${valueName[0].toUpperCase() + valueName.slice(1)}.Provider`;

    const useProvider = () => {
        const context = useContext(Context);
        if (context === undefined) {
            throw new Error(errorMessage);
        }
        return context;
    };

    const withProvider = <P extends object>(
        WrappedComponent: ComponentType<P>
    ): React.FC<P> => {
        const ComponentWithProvider: React.FC<P> = (props: P) => {
            const value = useProvider();
            return (
                <Provider {...props}>
                    <WrappedComponent {...props} {...{ [valueName]: value }} />
                </Provider>
            );
        };
        // Asignar displayName para el HOC utilizando valueName y el nombre del componente envuelto
        ComponentWithProvider.displayName =
            `with${valueName[0].toUpperCase() + valueName.slice(1)}Provider(` +
            `${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
        return ComponentWithProvider;
    };

    return { Provider, useProvider, withProvider };
}
