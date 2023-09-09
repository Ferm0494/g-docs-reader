import { AuthContext } from 'contexts/Auth';
import { useEffect, useState, useContext } from 'react';
import { DocsService } from 'services/docs.service';

interface DocsInterface {
   content: string;
   title: string;
   id: string;
}

const Docs = () => {
   const [data, setData] = useState<null | DocsInterface[]>(null);
   const [error, setError] = useState(false);
   const [input, setInput] = useState('');

   const {authState, handleSwitchAccount} = useContext(AuthContext);
   const getDocs = () => {
      if (authState.selectedAccount)
         DocsService.getAccountDocs(authState.selectedAccount)
            .then((data) => {
               setData(data.docs);
            })
            .catch((error) => {
               console.error(error);
               setData([]);
               setError(true);
            });
   };
   const handleLoad = (docId: string) => {
      if (authState.selectedAccount)
         DocsService.loadDocument(authState.selectedAccount, docId )
            .then(() => {
               getDocs();
            })
            .catch((error) => {
               setError(true);
               console.error(error);
            });
   };
   useEffect(() => {
      getDocs();
   }, [authState.selectedAccount]);

   return (
      <div>
         <h1>Documents</h1>
         <div>
            {error && <p>There was an error loading your documents</p>}
            {!data && <p>Loading...</p>}
            {data && (
               <ul>
                  {data.map((doc, index) => (
                     <div key={doc.id} className="doc">
                        <h3>{index + 1}.</h3>
                        <li>{doc.content}</li>
                        <button onClick={() => handleLoad(doc.id)}> Reload </button>
                     </div>
                  ))}
               </ul>
            )}

            <label>
               Enter a new Document ID:{' '}
               <input name="myInput" value={input} onChange={(e) => setInput(e.target.value)} />
               <button onClick={()=> handleLoad(input)}>Load</button>
            </label>
            <button onClick={handleSwitchAccount}>Switch Account</button>
         </div>
      </div>
   );
};
export default Docs;
