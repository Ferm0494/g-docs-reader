import { GoogleAuth } from "./auth-providers/google-auth.service";

export class DocsService {
    static async getAccountDocs(account: string){
        const res = await fetch(`${import.meta.env.VITE_CLOUD_FUNCTIONS_HOST}/docs?userId=${GoogleAuth.getInstance().auth.currentUser?.uid}&account=${account}`);
        return res.json();
    }
    static async loadDocument(account: string, docId: string){
        const res = await fetch(`${import.meta.env.VITE_CLOUD_FUNCTIONS_HOST}/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: GoogleAuth.getInstance().auth.currentUser?.uid,
                email: account,
                document: docId,
            }),
        });
        return res.json();
    }
}