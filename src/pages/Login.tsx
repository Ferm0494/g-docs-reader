import {useContext} from 'react' 
import {AuthContext} from 'contexts/Auth'

const Login = () => {
   const authContext = useContext(AuthContext);
   return (
      <div>
         <button onClick={authContext.loginWithGoogle}>Login</button>
      </div>
   );
};
export default Login;
