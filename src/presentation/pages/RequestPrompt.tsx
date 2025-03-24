import React, { useState } from 'react';

interface RequestPromptProps {
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmButtonText?: string;
    version?: string;
}

const RequestPrompt: React.FC<RequestPromptProps> = ({
    title,
    message,
    onConfirm,
    confirmButtonText = "Aceptar",
    version
}) => {
    const [show, setShow] = useState(true)
    if (!show) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="bg-indigo-600 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <h1 className="text-2xl font-bold text-center text-gray-800">{title}</h1>
                    <p className="text-center text-gray-600">{message}</p>
                    {version && <p className="text-center text-indigo-600 font-medium text-lg">v{version}</p>}
                    <div className="mt-4 flex justify-center">
                        <img
                            src="/img/update-illustration.svg"
                            alt="Prompt"
                            className="h-32 w-auto opacity-80"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    </div>
                </div>
                {onConfirm && (
                    <div className="bg-gray-50 p-4 flex justify-end">
                        <button
                            className="inline-flex justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            onClick={onConfirm}
                        >
                            {confirmButtonText}
                        </button>
                    </div>
                )}
                {!onConfirm && (
                    <div className="bg-gray-50 p-4 flex justify-end">
                        <button
                            className="inline-flex justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            onClick={() => setShow(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestPrompt;
