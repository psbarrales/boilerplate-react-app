import { IPost } from "@domain/models/entities/IPost";
import PostProvider, { usePost } from "@providers/PostProvider";
import { withProvider } from "@providers/withProvider";
import { Search } from "lucide-react";

const Home: React.FC = () => {
    const { usePosts } = usePost()
    const { data } = usePosts();
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col gap-8">
                {/* Banner de mensaje para edición */}
                <div className="bg-amber-100 border-l-4 border-amber-500 p-4 mb-4 rounded">
                    <p className="text-amber-700">
                        <span className="font-bold">Nota para desarrolladores:</span> Para modificar el contenido de esta página, edita el archivo <code className="bg-amber-200 px-1 rounded">presentation/pages/Home/Home.tsx</code>
                    </p>
                </div>

                {/* Cabecera */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-bold tracking-tight">Mi Sitio Web</h1>
                    <p className="text-gray-600 max-w-[600px] mx-auto">
                        Un lugar para compartir ideas, conocimientos y experiencias.
                    </p>
                </div>

                {/* Buscador */}
                <div className="w-full max-w-3xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar contenido..."
                            className="w-full pl-10 py-2 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Sección de Categorías */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Categorías</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="h-32 flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <span className="text-3xl">📝</span>
                            <span>Artículos</span>
                        </button>
                        <button className="h-32 flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <span className="text-3xl">📚</span>
                            <span>Tutoriales</span>
                        </button>
                        <button className="h-32 flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <span className="text-3xl">🧪</span>
                            <span>Proyectos</span>
                        </button>
                        <button className="h-32 flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <span className="text-3xl">👋</span>
                            <span>Sobre mí</span>
                        </button>
                    </div>
                </div>

                {/* Artículos Recientes */}
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Artículos Recientes</h2>
                        <button className="text-blue-600 hover:text-blue-800">Ver todos</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {data?.slice(0, 6).map((post: IPost) => (
                            <div key={post.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-48 bg-gray-200" style={{ backgroundImage: `url('https://placehold.co/400x200')`, backgroundSize: "cover" }}></div>
                                <div className="p-4">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="font-bold text-lg">{post.title}</h3>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Nuevo</span>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-2">Publicado el 15 de Junio, 2023</p>
                                    <p className="text-gray-700 mb-4">{post.body}</p>
                                    <button className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Leer más</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Proyectos Destacados */}
                <div className="mt-8 mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Proyectos Destacados</h2>
                        <button className="text-blue-600 hover:text-blue-800">Ver todos</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Proyecto 1 */}
                        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-xl mb-2">Gestor de Tareas</h3>
                            <p className="text-gray-500 text-sm mb-3">React • TypeScript • Firebase</p>
                            <p className="text-gray-700 mb-4">Una aplicación web para gestionar tareas y proyectos con colaboración en tiempo real.</p>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Demo</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Código</button>
                            </div>
                        </div>

                        {/* Proyecto 2 */}
                        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-xl mb-2">API RESTful</h3>
                            <p className="text-gray-500 text-sm mb-3">Node.js • Express • MongoDB</p>
                            <p className="text-gray-700 mb-4">Una API completa con autenticación, autorización y operaciones CRUD.</p>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Documentación</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Código</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t pt-6 mt-10 text-center text-gray-500">
                    <p>© 2023 Mi Sitio Web. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    );
};

export default withProvider([PostProvider], Home);
