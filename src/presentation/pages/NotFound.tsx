import { useNavigate } from 'react-router';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Volver</span>
                    </button>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-md">
                    <div className="text-9xl font-extrabold text-gray-400 animate-pulse">404</div>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">Página no encontrada</h1>
                    <p className="mt-6 text-base text-gray-500">Lo sentimos, no pudimos encontrar la página que estás buscando.</p>
                    <div className="mt-10">
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Ir al inicio
                        </button>
                    </div>
                </div>
            </main>

            <footer className="bg-white py-4 text-center text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default NotFound;
