import Login from 'pages/Login';
import NotFound from 'pages/NotFound';
import SelectAccount from 'pages/SelectAccount';
import Docs from 'pages/Docs'

export const ROUTES = {
    login: {
        path: "/login",
        name: "Login",
        element: <Login/>,
    },
    selectAccount: {
        path: "/select-account",
        name: "Select Account",
        element: <SelectAccount/>,
    },
    docs:{
        path: "/docs",
        name: "Docs",
        element:  <Docs/>
    },
    notFound: {
        path: '*',
        name: 'Not Found',
        element: <NotFound/>
    }

}