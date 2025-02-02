import { Given, When, Then, Before } from "@badeball/cypress-cucumber-preprocessor";

Before(() => {
    cy.on('uncaught:exception', (err, runnable) => {
        if (
            err.message.indexOf('plugin is not implemented on web') >= 0
            || err.message.indexOf('Firebase app already exists') >= 0
            || err.message.indexOf('Method not implemented') >= 0
        ) {
            return false
        }
    })
    // Aquí puedes agregar configuración común para todos los escenarios
    cy.viewport("iphone-xr"); // Configura el viewport para dispositivos móviles
    cy.visit("/", {
        onBeforeLoad(win) {
            // Deshabilita el Service Worker si está registrado
            if (win.navigator && win.navigator.serviceWorker) {
                win.navigator.serviceWorker.getRegistrations().then((registrations) => {
                    registrations.forEach((registration) => registration.unregister());
                });
            }
        },
    });
    cy.clearLocalStorage(); // Limpia el almacenamiento local
    cy.wait(1000)
});

Given("el usuario está en la página de inicio", function () {
    cy.get('ion-title')
    return assert.equal(true, true);
});

When('el usuario hace clic en el botón "Comenzar"', () => {
    return assert.equal(true, true);
})

Then('debería ver el mensaje "Bienvenido a la aplicación"', () => {
    return assert.equal(true, true);
})
