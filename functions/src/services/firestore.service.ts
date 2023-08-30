import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
  collection,
  setDoc,
  getDoc,
  // getDocs,
  doc,
} from "firebase/firestore";
import {initializeApp} from "firebase/app";
import * as logger from "firebase-functions/logger";
import {DocsService} from "./docs.service";
import {BaseService} from "./base.service";
import {CreateUserDto} from "../dtos/create-user.dto";

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
  static async getDoc(resource: Collection, key: string) {
    const docRef = doc(FirestoreService.getInstance(), resource, key);
    return getDoc(docRef);
  }
  static getCollection(resource: Collection) {
    return collection(FirestoreService.getInstance(), resource);
  }
  static async addUser(user: Required<CreateUserDto>) {
    try {
      const usersRef = this.getCollection("users");
      await setDoc(doc(usersRef, user.email), {
        refreshToken: user.refreshToken,
      });
      logger.info("User added", {user: user.email});
    } catch (error) {
      logger.error("Error adding user", {user: user, error});
      throw error;
    }
  }
  static async addDocToUser(
    userMail: string,
    document: ReturnType<typeof DocsService.transformDocToMarkdown>
  ) {
    const usersRef = this.getCollection("users");
    const docRef = collection(doc(usersRef, userMail), "docs");
    await setDoc(
      doc(docRef, document.id),
      {
        content: document.markdown,
      },
      {merge: true}
    );
  }
}
