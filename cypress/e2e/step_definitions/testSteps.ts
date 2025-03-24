import {
    Given,
    Then,
    Before,
} from "@badeball/cypress-cucumber-preprocessor";

Before(() => {
    cy.on("uncaught:exception", (err) => {
        if (
            err.message.indexOf("plugin is not implemented on web") >= 0 ||
            err.message.indexOf("Firebase app already exists") >= 0 ||
            err.message.indexOf("Method not implemented") >= 0
        ) {
            return false;
        }
    });
    // Aquí puedes agregar configuración común para todos los escenarios
    cy.viewport("iphone-xr"); // Configura el viewport para dispositivos móviles
    cy.visit("/", {
        onBeforeLoad(win) {
            // Deshabilita el Service Worker si está registrado
            if (win.navigator && win.navigator.serviceWorker) {
                win.navigator.serviceWorker
                    .getRegistrations()
                    .then((registrations) => {
                        registrations.forEach((registration) =>
                            registration.unregister()
                        );
                    });
            }
        },
    });
    cy.clearLocalStorage(); // Limpia el almacenamiento local
    cy.wait(100);
});

Given("el usuario está en la página de inicio", function () {
    cy.location("pathname").should("eq", "/app/home");
});

Then("existe el texto {string}", (text: string) => {
    cy.log("Text", text);
    cy.contains(text).should("be.visible");
});

Then("existe la sección {string}", (sectionName: string) => {
    cy.contains(sectionName).should("be.visible");
});
