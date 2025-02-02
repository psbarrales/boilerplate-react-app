import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
    :root {
        --primary-color: ${({ theme }) => theme.colors.primary};
        --secondary-color: ${({ theme }) => theme.colors.secondary};
        --black: ${({ theme }) => theme.colors.black};
        --font-family: 'Open Sans'
    }

`;

export default GlobalStyles;
