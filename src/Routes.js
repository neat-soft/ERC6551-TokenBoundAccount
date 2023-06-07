import {
    Route,
    Routes,
    Redirect,
    RouteComponentProps } from 'react-router-dom';
import WalletLayout  from './layouts/wallet';
import TokenLayout from './layouts/token';
import IndexLayout from './layouts';
const routes = [
    {
        key: "wallet",
        route: "/wallet/:address",
        component: <WalletLayout />,
    },
    {
        key: "nfts",
        route: "/token/:address/:tokenId",
        component: <TokenLayout />,
    }
]
export default function RouterContainer(props) {
    const getRoutes = (allRoutes) =>
        allRoutes.map((route) => {
            if (route.route) {
                return (
                    <Route path={route.route} element={route.component} key={route.key} />
                );
            }
            return null;
        });

    return (
        <Routes>
            {/* <Route {...props} exact path="/" component={IndexLayout}/> */}
            {getRoutes(routes)}
        </Routes>
            
    );
}