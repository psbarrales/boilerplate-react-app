import { useUser } from '@providers/UserProvider';
import { useAnalytics } from '@providers/withAnalyticsProvider';
import { useApp } from '@providers/withAppProvider';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

interface IProps { }

const Home: React.FC<IProps> = () => {

    const navigate = useNavigate()
    const analytics = useAnalytics()
    const app = useApp()
    const { user } = useUser()

    useEffect(() => {
        const getInfo = async () => {
            await app.getInfo()
        }
        analytics.registerView('Home.v3')
        getInfo()

    }, [])

    const navigateTab = (e: any) => navigate("/app/home/" + e.detail.tab)

    return (
        <div>
            <div>
                <div>
                    <div>{user?.full_name}</div>
                </div>
            </div>
            <div>
                <div>
                    <Outlet />
                    {/*  FIXME: IonTab deben existir para que Outlet funcione */}
                    <div style={{ display: 'none' }}></div>
                    <div style={{ display: 'none' }}></div>

                    <div slot="bottom">
                        <div onClick={navigateTab}>
                            Home
                        </div>
                        <div onClick={navigateTab}>
                            Items
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
