from dotenv import load_dotenv
from openai import OpenAI
import json
import os
import threading
import time
import sys

load_dotenv()

def prompt():
    return """Eres un generador de contenido documental para un proyecto, `dado un template + valores => Actualizas al documento`
## Usando el template y estos valores:
Nombre Proyecto: {project_name}
Repositorio: {repository}
```json
{package}
```

# Usando esta codigo, estructura y template:
```
{template}
```
### Actualiza el documento Arquitectura.md haciendolo más detallado para los ejemplos
"""

event = False

def llm_guide_content(template, project_name, repository_url, package_json, directory_tree, repo):
    global event
    client = OpenAI(
        base_url = "https://api.groq.com/openai/v1", 
        api_key=os.environ.get("GROQ_API_KEY"),  # This is the default and can be omitted
    )
    prompt_value = prompt().format(
        template=template, 
        project_name=project_name, 
        repository=repository_url, 
        package=package_json, 
    )

    print("Procesando... Esto puede tomar unos segundos:")  # Mensaje inicial
    start_time = time.time()  # Inicia el contador de tiempo

    # Función para mostrar logs periódicos
    def log_progress():
        while not event.is_set():
            elapsed_time = time.time() - start_time
            print(f"Procesando: {int(elapsed_time)}s...")
            time.sleep(1)

    # Evento para detener los logs
    # event = threading.Event()
    # log_thread = threading.Thread(target=log_progress)
    # log_thread.start()

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": f"""### CodeBase
--- directory_tree ---
```
{directory_tree}
```
--- code ---
{repo}
--- /code ---
### Use Codebase to update the document
----"""
            },
            {
                "role": "user",
                "content": prompt_value,
            }
        ],
        model="qwen-2.5-coder-32b",
        # model="gpt4-o",
        max_tokens=8000
    )

    print(chat_completion)

    return chat_completion.choices[0].message.content
    


def generate_guide():
    package_json = ""
    with open('../package.json', 'r', encoding='utf-8') as f:
        package_json = f.read()
        package = json.loads(package_json)  # Parse the raw string into a JSON object if needed

    project_name = package.get('name', 'Nombre del Proyecto')
    project_version = package.get('version', '1.0.0')
    project_description = package.get('description', '')
    repository_url = 'git@github.com:Cencosud-xlabs/shopping-app.git'  # Puedes ajustar esto si es necesario

    directory_tree = generate_directory_tree()
    with open('./Template.md', 'r', encoding='utf-8') as f:
        template = f.read()
    with open('./repo.md', 'r', encoding='utf-8') as f:
        repo = f.read()
    # template = generate_template(project_name, project_version, repository_url, directory_tree)

    with open('./Arquitectura.md', 'w', encoding='utf-8') as f:
        chat_completion = llm_guide_content(template, project_name, repository_url, package_json, directory_tree, repo)
        f.write(chat_completion)
    # event.set()



def generate_directory_tree():
    # Ignorar ciertas carpetas
    ignore_dirs = {'.git', 'node_modules', '__pycache__', 'android', 'ios', 'fonts'}
    structure = []

    start_path = '../'
    base_level = start_path.rstrip(os.sep).count(os.sep)

    for root, dirs, files in os.walk(start_path):
        # Filtrar directorios ignorados
        dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith('.')]
        
        current_level = root.rstrip(os.sep).count(os.sep) - base_level
        if current_level >= 4:
            # No descender más allá del segundo nivel
            dirs[:] = []
            continue

        indent = '    ' * current_level
        folder = os.path.basename(root)
        structure.append(f"{indent}├── {folder}/")

        subindent = '    ' * (current_level + 1)
        for f in files:
            structure.append(f"{subindent}├── {f}")

    return '\n'.join(structure)

def generate_template(project_name, project_version, repository_url, directory_tree):
    template = f"""# Guía de Contribución y Arquitectura del Proyecto
¡Bienvenido al proyecto **{project_name} v{project_version}**! Este documento tiene como objetivo proporcionar una visión general de la arquitectura, el stack tecnológico y las pautas para contribuir. Si eres nuevo en el proyecto, esta guía te ayudará a comprender cómo está estructurado y cómo puedes participar de manera efectiva.

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

{directory_tree}

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

bash
git clone {repository_url}

2. Instala las dependencias:

bash
cd {project_name}
npm install
# o usando yarn
yarn install


3. Inicia la aplicación en modo desarrollo:

bash
npm run dev
# o usando yarn
yarn dev

4. Accede a la aplicación:

Abre tu navegador y navega a http://localhost:3000 (o el puerto que indique la consola).

## Cómo Contribuir
Agradecemos tu interés en contribuir al proyecto. Sigue estas pautas para asegurarte de que tu contribución sea aceptada y beneficie a la comunidad.

### Flujo de Trabajo
1. Forkea el repositorio y clona tu fork localmente.

2. Crea una rama para tu característica o corrección:

bash
git checkout -b nombre-de-tu-rama


3. Realiza tus cambios asegurándote de seguir los estándares de código.

4. Escribe pruebas unitarias y/o E2E para tus cambios.

5. Asegúrate de que todas las pruebas pasen:

bash
npm run test
npm run test:e2e

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

bash
npm run test
# o
yarn test


- Ejecutar pruebas E2E:

bash
npm run test:e2e
# o
yarn test:e2e


### Uso de Storybook
Storybook se utiliza para documentar y probar visualmente los componentes de la interfaz de usuario.

- Iniciar Storybook:

bash
npm run storybook
# o
yarn storybook


- Agregar Historias:

Ubica tus historias junto al componente en la carpeta `src/presentation/components/Componente/Componente.stories.tsx`. Sigue el formato estándar de Storybook para definir las historias.

## Soporte y Contacto
Si tienes preguntas, problemas o sugerencias, por favor abre un Issue en el repositorio o contacta a los mantenedores del proyecto.

¡Gracias por contribuir! Tu participación es valiosa para nosotros y ayuda a mejorar el proyecto para todos.
"""
    return template

if __name__ == '__main__':
    generate_guide()