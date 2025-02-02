import React, { useEffect } from 'react';
import { loadStyles } from '@theme/styles/styles';
import FrameworkGlobalStyles from '@theme/FrameworkGlobalStyles';
import { useTheme, ThemeProvider } from 'styled-components';


export const FrameworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = useTheme()

    loadStyles
    useEffect(() => {
        const handleBackButton = (event: any) => {
            event.preventDefault();

            // Si hay historial disponible, retrocede
            if (window.history.length > 1) {
                window.history.back(); // Retrocede una página en el historial del navegador
            } else {
                console.log('No hay historial para retroceder.');
            }
        };

        // Escuchar el evento de hardware back
        document.addEventListener('backButton', handleBackButton);

        return () => {
            // Limpia el listener al desmontar el componente
            document.removeEventListener('backButton', handleBackButton);
        };
    }, []);

    return (
        <ThemeProvider theme={{ ...theme }}>
            <FrameworkGlobalStyles />
            {/* <IonApp> */}
            {children}
            {/* </IonApp> */}
        </ThemeProvider>

    )
};
