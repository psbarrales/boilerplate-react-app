import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { withPreferencesStorage } from '@providers/withPreferencesStorageProvider';
import { PreferencesStoragePort } from '@domain/ports/out/app/PreferencesStoragePort';
import { useAuth } from '@providers/AuthProvider';

interface IProps {
    preferencesStorage?: PreferencesStoragePort
}

const OTP: React.FC<IProps> = () => {
    const navigate = useNavigate()
    const auth = useAuth()
    const [code, setCode] = useState<string>()

    const validateCode = useCallback(async () => {
        alert("Validando...");
        await auth.checkCode(code as string, 'psbarrales@gmail.com')
        alert("Validación completada");
        navigate("/auth/otp");
    }, [code])

    return (
        <div>
            <header>
                <div>
                    <h1>Ingresar código</h1>
                </div>
            </header>
            <main>
                <ul>
                    <li>
                        <input value={code} placeholder='Código' type='text' onChange={(e) => setCode(e.target.value)} />
                    </li>
                </ul>
            </main>
            <footer>
                <div>
                    <button style={{ width: '100%' }} onClick={() => validateCode()}>Continuar</button>
                </div>
            </footer>
        </div>
    );
};

export default withPreferencesStorage(OTP);
