import { useUser } from '@providers/UserProvider';
import { useRef } from 'react';
import { useNavigate } from 'react-router';

interface IProps { }

const InviteToRegister: React.FC<IProps> = () => {
    const navigate = useNavigate()
    const user = useUser()

    return (
        <>
            <div>
                <div>
                    <div>
                        <span>Registrate</span>
                    </div>
                </div>
                <div></div>
            </div>
        </>

    );
};

export default InviteToRegister;
