import { createRoot } from 'react-dom/client';
import { FrameworkProvider } from '@providers/FrameworkProvider';
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '@theme/themes/defaultTheme';
import GlobalStyles from '@theme/GlobalStyles';
import App from './App';


const container = document.getElementById('root');
document.title = "My App :: Home";
const root = createRoot(container!);
root.render(
    <ThemeProvider theme={{ ...defaultTheme }}>
        <GlobalStyles />
        <FrameworkProvider>
            <App />
        </FrameworkProvider>
    </ThemeProvider>
);
