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
### Actualiza el documento README.md haciéndolo más detallado e informativo para los usuarios
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
    event = threading.Event()
    log_thread = threading.Thread(target=log_progress)
    log_thread.start()

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

    event.set()  # Detener los logs
    print("\nGeneración completada!")

    return chat_completion.choices[0].message.content
    

def generate_readme():
    package_json = ""
    with open('../package.json', 'r', encoding='utf-8') as f:
        package_json = f.read()
        package = json.loads(package_json)  # Parse the raw string into a JSON object if needed

    project_name = package.get('name', 'Nombre del Proyecto')
    project_version = package.get('version', '1.0.0')
    project_description = package.get('description', '')
    repository_url = package.get('repository', {}).get('url', '') or package.get('repository', '')
    if not repository_url:
        repository_url = 'https://github.com/psbarrales/boilerplate-react-app'  # URL predeterminada

    directory_tree = generate_directory_tree()
    
    # Cargar la plantilla README.template.md
    try:
        with open('./README.template.md', 'r', encoding='utf-8') as f:
            template = f.read()
    except FileNotFoundError:
        print("No se encontró el archivo README.template.md. Usando plantilla predeterminada.")
        template = generate_default_template(project_name, project_version, project_description)
    
    try:
        with open('./repo.md', 'r', encoding='utf-8') as f:
            repo = f.read()
    except FileNotFoundError:
        print("No se encontró el archivo repo.md. Procediendo sin información del repositorio.")
        repo = ""

    # Generar el README y guardarlo en la carpeta raíz del proyecto
    with open('../README.md', 'w', encoding='utf-8') as f:
        chat_completion = llm_guide_content(template, project_name, repository_url, package_json, directory_tree, repo)
        f.write(chat_completion)
        print(f"README.md generado exitosamente en {os.path.abspath('../README.md')}")


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
            # No descender más allá del cuarto nivel
            dirs[:] = []
            continue

        indent = '    ' * current_level
        folder = os.path.basename(root)
        structure.append(f"{indent}├── {folder}/")

        subindent = '    ' * (current_level + 1)
        for f in files:
            structure.append(f"{subindent}├── {f}")

    return '\n'.join(structure)

def generate_default_template(project_name, project_version, project_description):
    template = f"""# {project_name}

## Versión: {project_version}

{project_description}

## Descripción

[Añadir una descripción detallada del proyecto aquí]

## Características

- [Característica 1]
- [Característica 2]
- [Característica 3]

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

## Uso

[Añadir instrucciones de uso aquí]

## Estructura del Proyecto

[La estructura del proyecto se generará automáticamente]

## Contribución

1. Haz un Fork del proyecto
2. Crea tu rama de características (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo [añadir licencia aquí].

## Contacto

[Añadir información de contacto aquí]
"""
    return template

if __name__ == '__main__':
    generate_readme()