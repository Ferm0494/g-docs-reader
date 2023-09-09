import { AuthContextProvider } from 'contexts/Auth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ROUTES } from 'routes';

function App() {
   return (
      <BrowserRouter>
         <AuthContextProvider>
            {(authState) =>
            // We wait to render the routes until we have the authState.user either null or a User.
               authState.user !== undefined && (
                  <Routes>
                     {!authState.user && <Route path="*" element={ROUTES.login.element} />}
                     {authState.user && !authState.selectedAccount && (
                        <Route path="*" element={ROUTES.selectAccount.element} />
                     )}
                     { authState.selectedAccount && (
                        <>
                           <Route
                              path={ROUTES.docs.path}
                              element={ROUTES.docs.element}
                           />
                           <Route path={ROUTES.notFound.path} element={ROUTES.notFound.element} />
                        </>
                     )}
                  </Routes>
               )
            }
         </AuthContextProvider>
      </BrowserRouter>
   );
}

export default App;
