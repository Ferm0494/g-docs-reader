import GoogleButton from 'react-google-button';
import { AuthContext } from 'contexts/Auth';
import { useContext } from 'react';

const SelectAccount = () => {
   const { logOut, linkGoogleAccount } = useContext(AuthContext);
   return (
      <div>
         <GoogleButton onClick={linkGoogleAccount} label='Link Google Account'/>
         <button onClick={logOut}>Log out</button>
      </div>
   );
};

export default SelectAccount;
