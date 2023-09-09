import { createContext, useState, Dispatch, useEffect, FC, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut, UserCredential } from '@firebase/auth';
import { GoogleAuth } from 'services/auth-providers/google-auth.service';
import { ROUTES } from 'routes';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface AuthState {
   user?: null | User;
   accounts: string[];
   selectedAccount?: null | string;
}

// Reason why is undefined intial state rather than null, is because if there's no user firebase returns null.
const initalAuthState = {
   user: undefined,
   accounts: [],
   selectedAccount: undefined,
};

export const AuthContext = createContext<{
   authState: AuthState;
   dispatchAuthState?: Dispatch<React.SetStateAction<AuthState>>;
   loginWithGoogle?: () => Promise<UserCredential>;
   logOut?: () => Promise<void>;
   linkGoogleAccount?: () => void;
   handleSwitchAccount?: ()=>void;
}>({
   authState: initalAuthState,
   dispatchAuthState: undefined,
   loginWithGoogle: undefined,
   logOut: undefined,
   handleSwitchAccount: undefined
});

type Props = {
   children: (args: AuthState) => ReactNode;
};

export const AuthContextProvider: FC<Props> = ({ children }) => {
   const STORAGE_KEY = 'AUTH_EMAIL_ACCOUNT';
   const [authState, setAuthState] = useState<AuthState>({
      ...initalAuthState,
      selectedAccount: sessionStorage.getItem(STORAGE_KEY),
   });
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const loginWithGoogle = async () => {
      return GoogleAuth.login().then((credentials) => {
         navigate(ROUTES.selectAccount.path);
         return credentials;
      });
   };
   const handleSwitchAccount = () => {
      sessionStorage.removeItem(STORAGE_KEY);
      setAuthState({
         ...authState,
         selectedAccount: null,
      });
      navigate(ROUTES.selectAccount.path);
   };
   const logOut = async () => {
      return signOut(GoogleAuth.getInstance().auth).then(() => {
         navigate(ROUTES.login.path);
      });
   };

   const linkGoogleAccount = () => {
      window.addEventListener('message', (event) => {
         if (event.origin !== window.location.origin || !event.data.email) return;
         const { email } = event.data;
         sessionStorage.setItem(STORAGE_KEY, email);
         setAuthState({
            ...authState,
            selectedAccount: email,
         });
         navigate(ROUTES.docs.path);
      });
      window.addEventListener('load', () => sessionStorage.removeItem(STORAGE_KEY));
      return GoogleAuth.linkGoogleAccount();
   };
   onAuthStateChanged(GoogleAuth.getInstance().auth, (user) => {
      if (!user && authState.user) {
         setAuthState({
            ...authState,
            user,
         });
      } else if (user && !authState.user) {
         setAuthState({
            ...authState,
            user,
         });
      } else if (!user && authState.user === undefined) {
         //  Reduces the small blink of the select-account page.
         setAuthState({
            ...authState,
            user,
         });
      }
   });
   useEffect(() => {
      if (window.opener) {
         window.opener.postMessage({ email: searchParams.get('email') }, window.location.origin);
         window.close();
      }
      return () => {
         window.removeEventListener('message', () => {
            console.log('removed message listener');
         });
      };
   }, []);
   return (
      <AuthContext.Provider
         value={{
            authState,
            loginWithGoogle,
            logOut,
            linkGoogleAccount,
            handleSwitchAccount,
         }}
      >
         {children(authState)}
      </AuthContext.Provider>
   );
};
