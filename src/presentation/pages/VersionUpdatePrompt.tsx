import React from 'react';

interface IProps { }

const VersionUpdatePrompt: React.FC<IProps> = () => {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="bg-indigo-600 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Actualización Disponible</h2>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <h1 className="text-2xl font-bold text-center text-gray-800">Actualización Disponible</h1>
                    <p className="text-center text-gray-600">Hay una nueva actualización disponible</p>
                    <p className="text-center text-indigo-600 font-medium text-lg">v0.0.1</p>
                    <div className="mt-4 flex justify-center">
                        <img
                            src="/img/update-illustration.svg"
                            alt="Actualización"
                            className="h-32 w-auto opacity-80"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    </div>
                </div>
                <div className="bg-gray-50 p-4 flex justify-end">
                    <button
                        className="inline-flex justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        onClick={() => confirm()}
                    >
                        Actualizar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VersionUpdatePrompt;
