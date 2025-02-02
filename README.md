# Boilerplate App Template - v1.0.0

Bienvenido al proyecto base para el desarrollo de aplicaciones. Este sistema está construido con **Vite**, diseñado para ser modular, escalable y mantenible. Utiliza una **arquitectura hexagonal** (Ports and Adapters) que garantiza el desacoplamiento entre capas y facilita la evolución del sistema.

## Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Requisitos Previos](#requisitos-previos)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
5. [Contribuir al Proyecto](#contribuir-al-proyecto)
6. [Recursos Adicionales](#recursos-adicionales)

---

## Descripción del Proyecto

Este boilerplate está diseñado para construir aplicaciones modernas utilizando **React**, con **Vite** como empaquetador. Está optimizado para ofrecer:

- Modularidad y escalabilidad gracias a su **arquitectura hexagonal**.
- Pruebas robustas mediante **Testing Library** (unitarias) y **Cypress** con **Cucumber** (E2E).
- Documentación visual de componentes con **Storybook**.

---

## Requisitos Previos

Para trabajar en este proyecto, necesitas tener instalados los siguientes programas:

- **Node.js**: versión 14 o superior.
- **npm** o **yarn**.
- **Git**.

---

## Configuración del Entorno

1. **Clona el repositorio**:

   ```bash
   git clone this/boilerplate-app.git
   cd boilerplate-app
   ```

2. **Instala las dependencias**:

   ```bash
   npm install
   # o
   yarn install
   ```

3. **Ejecuta el proyecto en modo desarrollo**:

   ```bash
   npm run dev
   # o
   yarn dev
   ```

4. **Accede a la aplicación** en tu navegador en `http://localhost:5173/`.

---

## Arquitectura del Proyecto

El proyecto utiliza una **arquitectura hexagonal** que separa la lógica de negocio, la infraestructura y la interfaz de usuario. Esto facilita el mantenimiento, las pruebas y la implementación de nuevas funcionalidades.

![Diagrama de Arquitectura](docs/architecture.png)

Para una explicación completa de las carpetas y cómo interactúan las capas, consulta [docs/Arquitectura.md](docs/Arquitectura.md).

---

## Contribuir al Proyecto

Contribuciones son bienvenidas. Sigue los pasos descritos en [docs/Contribución.md](docs/Contribución.md) para asegurarte de que tu contribución sea aceptada.

**Resumen de pasos para contribuir:**

1. Haz un fork del repositorio.
2. Crea una rama para tu funcionalidad o corrección.
3. Realiza tus cambios y asegura que las pruebas pasen.
4. Abre un Pull Request hacia la rama `main`.

---

## Recursos Adicionales

- **[Guía de Contribución](docs/Contribución.md)****:** Detalles sobre cómo colaborar y mantener el código consistente.
- **[Arquitectura del Proyecto](docs/Arquitectura.md)****:** Explicación detallada de la estructura y las responsabilidades de cada carpeta.
- **Storybook:** Ejecuta `npm run storybook` para ver los componentes disponibles.

---

¡Gracias por utilizar este boilerplate! Tu colaboración es clave para su éxito.
