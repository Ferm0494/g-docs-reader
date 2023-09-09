import { initializeApp } from '@firebase/app';
import {
   GoogleAuthProvider,
   signInWithPopup,
   getAuth,
   connectAuthEmulator,
   setPersistence,
   browserSessionPersistence,
} from '@firebase/auth';

export class GoogleAuth {
   private static firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
   private static app = initializeApp(this.firebaseConfig);
   private static Singleton: GoogleAuthProvider;

   static getInstance() {
      if (!this.Singleton) {
         this.Singleton = new GoogleAuthProvider();
         if (import.meta.env.DEV) {
            connectAuthEmulator(
               getAuth(this.app),
               import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST,
            );
         }
      }
      return { auth: getAuth(this.app), provider: this.Singleton };
   }
   static async login() {
      return setPersistence(this.getInstance().auth, browserSessionPersistence).then(() =>
         signInWithPopup(this.getInstance().auth, this.getInstance().provider)
      )
   }
   static linkGoogleAccount() {
      const url = `${import.meta.env.VITE_CLOUD_FUNCTIONS_HOST}/oauth?userId=${this.getInstance().auth.currentUser?.uid}`;
      window.open(url);
   }
}
