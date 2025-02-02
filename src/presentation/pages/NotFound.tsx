import { useNavigate } from 'react-router';

interface IProps { }

const NotFound: React.FC<IProps> = () => {

    const navigate = useNavigate()

    return (
        <div>
            <header>
                <div>
                    <button onClick={() => navigate(-1)}>
                        <span>Volver</span>
                    </button>
                    <h1>No encontrado</h1>
                </div>
            </header>
            <main>
                <h1>Está vista no existe</h1>
            </main>
        </div>
    );
};

export default NotFound;
