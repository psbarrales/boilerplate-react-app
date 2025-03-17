import os

def generar_markdown_ts_tsx(rutas):
    """
    Recorre recursivamente cada una de las rutas en 'rutas', buscando
    archivos con extensión .ts o .tsx. Devuelve un string con el contenido
    en formato Markdown, donde cada archivo se presenta con:
    
    ## <ruta del archivo>
    ```<ts|tsx>
    <contenido del archivo>
    ```
    """
    markdown_parts = []

    for ruta_base in rutas:
        # Normalizamos la ruta en caso de necesitarlo
        ruta_base = os.path.abspath(ruta_base)

        for root, dirs, files in os.walk(ruta_base):
            for filename in files:
                if filename.endswith('.ts') or filename.endswith('.tsx'):
                    ruta_completa = os.path.join(root, filename)
                    
                    # Determinar el lenguaje para el bloque de código
                    lenguaje = 'tsx' if filename.endswith('.tsx') else 'ts'
                    
                    # Leemos el contenido del archivo
                    try:
                        with open(ruta_completa, 'r', encoding='utf-8') as f:
                            contenido = f.read()
                    except Exception as e:
                        contenido = f"Error al leer el archivo {ruta_completa}: {e}"
                    
                    # Construimos el bloque de Markdown
                    markdown_parts.append(f"## {ruta_completa}")
                    markdown_parts.append(f"```{lenguaje}")
                    markdown_parts.append(contenido)
                    markdown_parts.append("```")
                    markdown_parts.append("")  # Línea en blanco opcional

    # Unimos todos los bloques en un solo string
    return "\n".join(markdown_parts)

if __name__ == '__main__':
    # Ajusta o define las rutas que desees recorrer
    rutas_a_buscar = [
        "../src/application",
        "../src/domain",
        "../src/infrastructure",
        "../src/presentation",
        "../src/providers",
        "../src/routes",
        # "/Users/consultor/Development/shopping-app/src/components/foodie",
        # "/Users/consultor/Development/shopping-app/src/pages/foodie-flow",
        # "/Users/consultor/Development/shopping-app/src/pages/foodie-orders",
        # Agrega aquí más rutas si lo deseas
    ]

    # Generamos todo el Markdown a partir de las rutas definidas
    markdown_final = generar_markdown_ts_tsx(rutas_a_buscar)

    # Imprimimos por consola (puedes redirigir a un archivo si lo deseas)
    print(markdown_final)
