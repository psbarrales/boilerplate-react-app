# Reimportar las librerías necesarias debido al reinicio del estado
import matplotlib.pyplot as plt
import networkx as nx

# Crear el gráfico dirigido
G = nx.DiGraph()

# Nodos principales
layers = ["Domain", "App", "Infrastructure", "Providers", "Presentation", "Theme", "Router", "Device/HTTP/Storage"]

# Agregar nodos
G.add_nodes_from(layers)

# Agregar relaciones entre capas
edges = [
    ("Infrastructure", "Providers"),
    ("Infrastructure", "App"),
    ("Providers", "App"),
    ("App", "Providers"),
    ("Providers", "Presentation"),
    ("Presentation", "Providers"),
    ("Theme", "Presentation"),
    ("Router", "Presentation"),
    ("Device/HTTP/Storage", "Infrastructure"),
]

G.add_edges_from(edges)

# Posiciones personalizadas (hexágono con nodo adicional)
positions = {
    "Domain": (0, 0),
    "App": (0.87, 0.5),
    "Infrastructure": (0.87, -0.5),
    "Providers": (0, -1),
    "Presentation": (-0.87, -0.5),
    "Theme": (-0.87, 0.5),
    "Router": (0, 1),
    "Device/HTTP/Storage": (1, -1),
}

# Configuración de colores para los nodos
node_colors = {
    "Domain": "#ff9999",        # Rojo claro
    "App": "#ffc966",           # Naranja claro
    "Infrastructure": "#66b3ff",# Azul claro
    "Providers": "#99ff99",     # Verde claro
    "Presentation": "#ffccff",  # Rosa claro
    "Theme": "#ffff99",         # Amarillo claro
    "Router": "#d9d9d9",        # Gris claro
    "Device/HTTP/Storage": "#c2c2f0"  # Púrpura claro
}

# Crear lista de colores en orden de nodos
node_colors_list = [node_colors[node] for node in G.nodes]

# Dibujar el grafo
plt.figure(figsize=(10, 10))
nx.draw_networkx_nodes(G, pos=positions, node_size=4900, node_color=node_colors_list, edgecolors="black")
nx.draw_networkx_edges(G, pos=positions, arrowstyle="->", arrowsize=20, edge_color="gray")

# Dibujar líneas punteadas entre Domain - Providers y Providers - Infrastructure
nx.draw_networkx_edges(
    G, pos=positions, edgelist=[("Providers", "Domain"), ("Domain", "App"), ("Domain", "Infrastructure"), ("App", "Infrastructure")],
    style="dashed", edge_color="black"
)

# Dibujar etiquetas
nx.draw_networkx_labels(G, pos=positions, font_size=9, font_color="black", font_weight="bold")

# Configurar diseño
plt.title("Arquitectura Hexagonal", fontsize=18)
plt.axis("off")
plt.show()
