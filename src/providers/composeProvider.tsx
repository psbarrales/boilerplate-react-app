import { ReactNode } from "react";

export const composeProviders =
    (...providers: Array<React.FC<{ children: ReactNode }>>) =>
        ({ children }: { children: ReactNode }) =>
            providers.reduceRight(
                (acc, Provider) => <Provider>{acc}</Provider>,
                children
            );
