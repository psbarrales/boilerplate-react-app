import type { Preview } from "@storybook/react";
import React, { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "../src/theme/themes/defaultTheme";
import { IonApp, setupIonicReact } from "@ionic/react";
import '../src/theme/styles/ionic-styles';
import '../src/theme/styles/variables.css';
import '@ionic/react/css/ionic.bundle.css';
import { loadIonicStyles } from "../src/theme/styles/ionic-styles";
import GlobalStyles from "../src/theme/GlobalStyles";
import IonicGlobalStyles from "../src/theme/IonicGlobalStyles";

loadIonicStyles();
setupIonicReact({
  mode: 'ios',
  swipeBackEnabled: true,
  hardwareBackButton: true,
});


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
      <IonApp>
        <ThemeProvider theme={defaultTheme}>
          <GlobalStyles />
          <IonicGlobalStyles />
          <Story />
        </ThemeProvider>
      </IonApp>
    ),
  ],
};

export default preview;
