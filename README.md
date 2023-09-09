## G-Doc Reader BE
## Get Started
1. Make sure you have Node > **18** version installed, currently using `18.17.1`.
2. Make sure you have installed globally `firebase-tools` with `npm install -g firebase-tools`.  
3. Make sure you have **pnpm** package manager installed.
4. Go to functions directory and run **pnpm install**.
5. In your root directory start the emulators with `firebase emulators:start`
6. You can view all your emulators running at `http://127.0.0.1:4002`
7. Make a watch of your functions with `pnpm build:watch`
8. Make sure that in your Functions Directory you have `.runtimeconfig.json` with these variables:
 - `[
      "CLIENT_ID",
      "CLIENT_SECRET",
      "PROJECT_ID",
      "NODE_ENV",
      "HOST",
      "CALLBACK_URL"
      "FE_HOST"
    ];`

## Endpoints.
- Add a new user with OAuth with **GET** `http://127.0.0.1:4000/gdoc-md-sync-391822/us-central1/oauth`
- Sync a Google Doc & within an Email with **POST** `http://127.0.0.1:4000/gdoc-md-sync-391822/us-central1/sync` ---> Body payload `{email: string, document: string}`, where **document** is the id of your Google Doc. 

### Stack
- TypeScript
- NodeJS
- Firebase Cloud Functions
- FireStore

# G-docs-reader FE
# React + TypeScript + Vite

- How to run it, in the root project run `pnpm install`;
- Make sure you have an .env within your root directory with the following values:
- `[
     "VITE_FIREBASE_CONFIG",
     "VITE_FIREBASE_AUTH_EMULATOR_HOST",
     "VITE_CLOUD_FUNCTIONS_HOST"
    ];`

- Start the emulators with `firebase emulators:start`
- Start the UI with `pnpm dev`
- Go to **http://localhost:5173**

