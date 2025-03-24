import React from 'react';

const Fallback: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-md">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                    <h1 className="mt-8 text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl">Cargando...</h1>
                    <p className="mt-4 text-base text-gray-500">Por favor, espera mientras preparamos el contenido.</p>
                </div>
            </main>

            <footer className="bg-white py-4 text-center text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default Fallback;
