import { defineConfig } from "cypress";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";


export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: false,
    specPattern: "**/*.feature",
    env: {
      stepDefinitions: "cypress/e2e/step_definitions/**/*.ts", // Asegura que el patrón apunte a los archivos .ts dentro de step_definitions
    },
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);


      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        }),
      );

      return config
    },
  },
});