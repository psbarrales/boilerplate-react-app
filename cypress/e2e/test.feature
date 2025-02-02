Feature: Pruebas básicas de la aplicación

  Scenario: El usuario visita la página principal
    Given el usuario está en la página de inicio
    When el usuario hace clic en el botón "Comenzar"
    Then debería ver el mensaje "Bienvenido a la aplicación"
