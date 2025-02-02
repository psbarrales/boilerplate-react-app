import { withPreferencesStorage } from '@providers/withPreferencesStorageProvider';
import { PreferencesStoragePort } from '@domain/ports/out/app/PreferencesStoragePort';
import { useNavigate } from 'react-router';
import { useCallback, useState } from 'react';
import { useAuth } from '@providers/AuthProvider';


interface IProps {
    preferencesStorage?: PreferencesStoragePort
}

const Login: React.FC<IProps> = () => {
    const navigate = useNavigate()
    const auth = useAuth()
    const [email, setEmail] = useState<string>()

    return (
        <div>
            <div>
                <div>
                    <div>Ingresar con Correo</div>
                </div>
            </div>
            <div>
                <div>
                    <div>
                        <input value={email} placeholder='Correo' type='email' />
                    </div>
                </div>
            </div>
            <div>
                <div>
                    <button
                        color="primary"
                        style={{ width: '100%' }}
                        type='button'
                        onClick={() => ({})}
                    >Continuar</button>
                </div>
            </div>
        </div>
    );
};

export default withPreferencesStorage(Login);
