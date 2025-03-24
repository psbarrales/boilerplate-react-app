Feature: Pruebas básicas de la aplicación

  Scenario: El usuario visita la página principal
    Given el usuario está en la página de inicio
    Then existe el texto "Mi Sitio Web"
    Then existe la sección "Artículos Recientes"
