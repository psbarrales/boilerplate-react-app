import { useUser, withUserProvider } from '@providers/UserProvider';
import { useEffect } from 'react';

interface IProps { }

const Items: React.FC<IProps> = () => {

    const { user } = useUser()

    useEffect(() => {
        if (user) {
            console.log({ user })
        }
    }, [user])

    return (
        <div>
            <div>
                <center><div>Items Page</div></center>
                <div>
                    <div>
                        Item 1
                    </div>
                    <div>
                        Item 2
                    </div>
                    <div>
                        Item 3
                    </div>
                    <div>
                        Item 4
                    </div>
                    <div>
                        Item 5
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withUserProvider(Items);
