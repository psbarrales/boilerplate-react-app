import type { Preview } from "@storybook/react";
import React, { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "../src/theme/themes/defaultTheme";
import '../src/theme/styles/styles';
import '../src/theme/styles/variables.css';
import GlobalStyles from "../src/theme/GlobalStyles";
import FrameworkGlobalStyles from "../src/theme/FrameworkGlobalStyles";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story): ReactElement => (
      <div>
        <ThemeProvider theme={defaultTheme}>
          <GlobalStyles />
          <FrameworkGlobalStyles />
          <Story />
        </ThemeProvider>
      </div>
    ),
  ],
};

export default preview;
