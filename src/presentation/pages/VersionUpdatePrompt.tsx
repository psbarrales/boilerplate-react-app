import React from 'react';

interface IProps { }

const VersionUpdatePrompt: React.FC<IProps> = () => {
    return (
        <div className="modal">
            <div className="header">
                <div className="toolbar">
                    <h1>Actualización Disponible</h1>
                </div>
            </div>
            <div className="content padding">
                <h1>Actualización Disponible</h1>
                <center>Hay una nueva actualización disponible</center>
                <center>v0.0.1</center>
            </div>
            <div className="footer">
                <button className="strong" onClick={() => confirm()}>
                    Actualizar
                </button>
            </div>
        </div>
    );
};

export default VersionUpdatePrompt;
