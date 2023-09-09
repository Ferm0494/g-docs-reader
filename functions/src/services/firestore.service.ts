import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
  collection,
  setDoc,
  getDoc,
  Timestamp,
  doc,
  getDocs,
} from "firebase/firestore";
import {initializeApp} from "firebase/app";
import * as logger from "firebase-functions/logger";
import {DocsService} from "./docs.service";
import {BaseService} from "./base.service";
import {CreateUserDto} from "../dtos/create-user.dto";
import {SyncUserDto} from "../dtos/sync-user.dto";
import {GetDocsDto} from "../dtos/get-docs.dto";

type Collection = "users";
export class FirestoreService extends BaseService {
  private static Singleton: Firestore;
  public static getInstance() {
    if (!FirestoreService.Singleton) {
      this.Singleton = getFirestore(
        initializeApp({projectId: this.getConfig().PROJECT_ID})
      );
      if (this.isNotProduction) {
        connectFirestoreEmulator(this.Singleton, this.getConfig().HOST, 4001);
      }
    }
    return this.Singleton;
  }
  static getDoc(resource: Collection, key: string[] = []) {
    const docRef = doc(FirestoreService.getInstance(), resource, ...key);
    return getDoc(docRef);
  }
  static getCollection(resource: Collection, key: string[] = []) {
    return collection(FirestoreService.getInstance(), resource, ...key);
  }
  static async addUser(user: Required<CreateUserDto>) {
    try {
      const usersRef = this.getCollection("users");
      const accountRef = collection(doc(usersRef, user.userId), "accounts");
      await setDoc(
        doc(accountRef, user.email),
        {
          refreshToken: user.refreshToken,
        }
      );
      logger.info("User added", {user: user.email});
    } catch (error) {
      logger.error("Error adding user", {user: user, error});
      throw error;
    }
  }
  static async getUserAccountDocs({account: userMail, userId}: GetDocsDto) {
    const usersRef = this.getCollection("users");
    const docRef = collection(doc(usersRef, userId, "accounts", userMail), "docs");
    const snapshot = await getDocs(docRef);
    return snapshot.docs.map((doc) => ({...doc.data(), id: doc.id}));
  }
  static async addDocToUser(
    {email: userMail, userId}: SyncUserDto,
    document: ReturnType<typeof DocsService.transformDocToMarkdown>
  ) {
    const usersRef = this.getCollection("users");
    const docRef = collection(doc(usersRef, userId, "accounts", userMail), "docs");
    const existingGdoc = await getDoc(doc(docRef, document.id));
    await setDoc(
      doc(docRef, document.id),
      {
        content: document.markdown,
        title: document.title,
        updatedAt: Timestamp.now(),
        ...(!existingGdoc.exists() && {createdAt: Timestamp.now()}),
      },
      {merge: true}
    );
  }
}
