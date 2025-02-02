import { useAuth } from '@providers/AuthProvider';
import { withPreferencesStorage } from '@providers/withPreferencesStorageProvider';
import { PreferencesStoragePort } from '@domain/ports/out/app/PreferencesStoragePort';
import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

interface IProps {
    preferencesStorage?: PreferencesStoragePort
}

const Login: React.FC<IProps> = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false)
    const [flow, setFlow] = useState<'INVITE' | 'EMAIL' | 'GOOGLE' | 'APPLE'>('INVITE')
    const auth = useAuth()

    const loginWithEmail = useCallback(async () => {
        await showInviteConcentModal()
        setFlow('EMAIL')
    }, [auth])

    const loginWithSSO = useCallback(async () => {
        navigate('/auth/sso/google')
        setFlow('GOOGLE')
    }, [auth])

    const loginAsGuest = useCallback(async () => {
        await showInviteConcentModal()
    }, [auth])

    const showInviteConcentModal = useCallback(async () => {
        setShowModal(true)
    }, [auth])

    const continueAsEmail = useCallback(async () => {
        if (location.pathname !== "/auth/email") {
            navigate("/auth/email");
        }
    }, [flow])

    async function confirm() {
        setShowModal(false);
        switch (flow) {
            case 'INVITE':
                break
            case 'EMAIL':
                continueAsEmail()
            default:
                break
        }
    }

    return (
        <div>
            <header>
                <div>
                    <h1>Register / Login</h1>
                </div>
            </header>
            <main>
                <ul>
                    <li>
                        {auth.isAuthenticated ? 'Logged' : 'Unauthorize'}
                    </li>
                    {auth.token && <li title='Token'>
                        {auth.token}
                    </li>}
                </ul>
            </main>
            <footer>
                <div>
                    <button onClick={loginWithEmail} style={{ width: '100%' }} type='button'>Ingresar con correo</button>
                </div>
                <div>
                    <button onClick={loginWithSSO} style={{ width: '100%' }} type='button'>Ingresar con SSO</button>
                </div>
                <div>
                    <button onClick={loginAsGuest} style={{ width: '100%' }} type='button'>Ingresar como invitado</button>
                </div>
            </footer>
            {showModal && (
                <div>
                    <header>
                        <div>
                            <button onClick={() => setShowModal(false)}>Cerrar</button>
                            <h2>Concentimiento</h2>
                        </div>
                    </header>
                    <main>
                        <div>
                            ¿Aceptas las condiciones?
                        </div>
                    </main>
                    <footer>
                        <button onClick={() => confirm()}>Aceptar</button>
                    </footer>
                </div>
            )}
        </div>
    );
};

export default withPreferencesStorage(Login);
