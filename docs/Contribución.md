# Guía de Contribución y Arquitectura del Proyecto
¡Bienvenido al proyecto **shopping-app v3.0.0**! Este documento tiene como objetivo proporcionar una visión general de la arquitectura, el stack tecnológico y las pautas para contribuir. Si eres nuevo en el proyecto, esta guía te ayudará a comprender cómo está estructurado y cómo puedes participar de manera efectiva.

## Tabla de Contenidos
- [Introducción](#introducción)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Descripción de las Capas](#descripción-de-las-capas)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Cómo Contribuir](#cómo-contribuir)
  - [Flujo de Trabajo](#flujo-de-trabajo)
  - [Estándares de Código](#estándares-de-código)
  - [Pruebas Unitarias y E2E](#pruebas-unitarias-y-e2e)
  - [Uso de Storybook](#uso-de-storybook)
- [Soporte y Contacto](#soporte-y-contacto)

## Introducción
Este proyecto es una aplicación desarrollada con Ionic v8 y Vite, siguiendo una arquitectura hexagonal para promover un código modular, mantenible y escalable. Utilizamos herramientas modernas para pruebas unitarias, pruebas de extremo a extremo y documentación de componentes.

## Stack Tecnológico
- **Framework Principal**: Ionic v8
- **Empaquetador**: Vite
- **Pruebas Unitarias**: Testing Library
- **Pruebas E2E**: Cypress con Cucumber
- **Documentación de Componentes**: Storybook
- **Lenguaje**: TypeScript
- **Estilos**: Styled Components y Ionic Theme
- **Control de Versiones**: Git

## Arquitectura del Proyecto
Seguimos una arquitectura hexagonal (Ports and Adapters) para asegurar el desacoplamiento entre las diferentes capas de la aplicación.

## Estructura de Carpetas
```
├── /
    ├── babel.config.json
    ├── ionic.config.json
    ├── tsconfig.node.json
    ├── index.html
    ├── .firebaserc
    ├── .eslintrc.cjs
    ├── .npmrc
    ├── .editorconfig
    ├── README.md
    ├── .gitignore
    ├── package-lock.json
    ├── package.json
    ├── .env
    ├── .nvmrc
    ├── commitlint.config.cjs
    ├── tsconfig.json
    ├── firebase.json
    ├── vite.config.ts
    ├── .browserslistrc
    ├── capacitor.config.ts
    ├── cypress.config.ts
    ├── cypress/
        ├── screenshots/
        ├── fixtures/
            ├── example.json
        ├── e2e/
            ├── test.feature
            ├── step_definitions/
                ├── testSteps.ts
        ├── downloads/
    ├── docs/
        ├── draw_diagram.py
        ├── guide_generator.py
        ├── 2. Arquitectura del Proyecto.md
        ├── .env
        ├── Guía de Contribución y Arquitectura del Proyecto.md
        ├── architecture.png
    ├── stories/
        ├── LoginPage.mdx
        ├── XPage.stories.tsx
        ├── XButton.stories.tsx
    ├── public/
        ├── favicon.png
        ├── manifest.json
    ├── src/
        ├── App.tsx
        ├── main.tsx
        ├── .DS_Store
        ├── setupTests.ts
        ├── vite-env.d.ts
        ├── providers/
            ├── withBooting.tsx
            ├── withPushNotificationProvider.tsx
            ├── withAppProvider.tsx
            ├── UserProvider.tsx
            ├── withErrorTrackingProvider.tsx
            ├── withPreferencesStorageProvider.tsx
            ├── withRemoteConfigProvider.tsx
            ├── composeProvider.tsx
            ├── FrameworkProvider.tsx
            ├── AuthProvider.tsx
            ├── withAnalyticsProvider.tsx
        ├── __test__/
            ├── App.test.tsx
            ├── application/
        ├── theme/
            ├── GlobalStyles.ts
            ├── IonicGlobalStyles.ts
            ├── styles/
                ├── variables.css
                ├── ionic-styles.ts
            ├── components/
                ├── XToolbar.tsx
                ├── XButton.tsx
                ├── PageLoading.tsx
                ├── index.ts
                ├── XTitle.tsx
                ├── XPage.tsx
            ├── icons/
            ├── themes/
                ├── defaultTheme.ts
            ├── tokens/
                ├── colors.ts
                ├── spacing.ts
        ├── hooks/
        ├── application/
            ├── auth/
                ├── useAuthorizationUseCase.ts
            ├── user/
                ├── useUserUseCase.ts
        ├── infrastructure/
            ├── capacitor/
                ├── useAppAdapter.ts
                ├── useCapacitorPreferencesStorageAdapter.ts
                ├── usePushNotificationsAdapter.ts
            ├── firebase/
                ├── useFirebaseAnalyticsAdapter.ts
                ├── useFirebaseErrorTrackingAdapter.ts
                ├── useFirebaseRemoteConfigAdapter.ts
                ├── initializeApp.ts
            ├── api/
                ├── useAxiosHTTPClient.ts
                ├── FetchHTTPClient.ts
                ├── useAuthorizationAPIClient.ts
                ├── useUserAPIClient.ts
        ├── domain/
            ├── models/
            ├── ports/
        ├── presentation/
            ├── layout/
            ├── components/
            ├── pages/
                ├── OnBoarding.tsx
                ├── NotImplemented.tsx
        ├── routes/
            ├── index.tsx
```

## Descripción de las Capas
- **Domain**: Contiene las entidades y puertos (interfaces) que definen la lógica de negocio.
- **Application**: Implementa los casos de uso como hooks que interactúan con los puertos del dominio.
- **Infrastructure**: Proporciona las implementaciones concretas de los puertos (conexiones a APIs, servicios externos, etc.).
- **Providers**: Gestiona los contextos y provee las dependencias a los componentes de la aplicación.
- **Presentation**: Incluye las páginas y componentes específicos de la interfaz de usuario.
- **Theme**: Contiene el sistema de diseño, estilos globales y componentes estilizados.
- **Routes**: Gestiona la navegación de la aplicación.

## Configuración del Entorno de Desarrollo
### Requisitos Previos
- Node.js (versión 14 o superior)
- npm o yarn
- Git

### Pasos para Configurar el Proyecto
1. Clona el repositorio:

```bash
git clone https://github.com/pablosebastian-barrales_cencosud/boilerplate-app.git
```

2. Instala las dependencias:

```bash
cd boilerplate-app
npm install
# o usando yarn
yarn install
```

3. Inicia la aplicación en modo desarrollo:

```bash
npm run dev
# o usando yarn
yarn dev
```

4. Accede a la aplicación:

Abre tu navegador y navega a http://localhost:5173 (o el puerto que indique la consola).

## Cómo Contribuir
Agradecemos tu interés en contribuir al proyecto. Sigue estas pautas para asegurarte de que tu contribución sea aceptada y beneficie a la comunidad.

### Flujo de Trabajo
1. Forkea el repositorio y clona tu fork localmente.

2. Crea una rama para tu característica o corrección:

```bash
git checkout -b nombre-de-tu-rama
```

3. Realiza tus cambios asegurándote de seguir los estándares de código.

4. Escribe pruebas unitarias y/o E2E para tus cambios.

5. Asegúrate de que todas las pruebas pasen:

```bash
npm run test
npm run test:e2e
```

6. Commitea tus cambios con mensajes claros y descriptivos.

7. Envía un Pull Request a la rama main del repositorio original.

### Estándares de Código
- **Lenguaje**: TypeScript es obligatorio para mantener la consistencia y aprovechar el tipado estático.
- **Estilo de Código**: Sigue las reglas definidas en el archivo `.eslintrc` y `.prettierrc`.
- **Nombres Significativos**: Usa nombres claros y descriptivos para variables, funciones y componentes.
- **Comentarios**: Comenta el código donde sea necesario para explicar lógica compleja.
- **No Rompas la Arquitectura**: Asegúrate de que tus cambios respeten la estructura y responsabilidades de cada capa.

### Pruebas Unitarias y E2E
#### Pruebas Unitarias:
- Ubicadas junto al archivo que están probando con la extensión `.test.ts` o `.test.tsx`.
- Usa Testing Library para pruebas de componentes y lógica.

#### Pruebas E2E:
- Ubicadas en `cypress/e2e/`.
- Usa Cypress y Cucumber para escribir pruebas legibles y basadas en comportamientos.

#### Comandos Útiles:

- Ejecutar pruebas unitarias:

```bash
npm run test
# o
yarn test
```

- Ejecutar pruebas E2E:

```bash
npm run test:e2e
# o
yarn test:e2e
```

### Uso de Storybook
Storybook se utiliza para documentar y probar visualmente los componentes de la interfaz de usuario.

- Iniciar Storybook:

```bash
npm run storybook
# o
yarn storybook
```

- Agregar Historias:

Ubica tus historias junto al componente en la carpeta `src/presentation/components/Componente/Componente.stories.tsx`. Sigue el formato estándar de Storybook para definir las historias.

## Soporte y Contacto
Si tienes preguntas, problemas o sugerencias, por favor abre un Issue en el repositorio o contacta a los mantenedores del proyecto.

¡Gracias por contribuir! Tu participación es valiosa para nosotros y ayuda a mejorar el proyecto para todos.