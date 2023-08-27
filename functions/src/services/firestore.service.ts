import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
  collection,
  setDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import {initializeApp} from "firebase/app";
import * as logger from "firebase-functions/logger";
import {DocsService} from "./docs.service";
import {BaseService} from "./base.service";

interface User {
  refreshToken: string;
  email: string;
  docs?: ReturnType<typeof DocsService.transformDocToMarkdown>;
}
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
  static async getDocs(resource: Collection) {
    return getDocs(this.getCollection(resource));
  }
  static getCollection(resource: Collection) {
    return collection(FirestoreService.getInstance(), resource);
  }
  static async addUser(user: User) {
    try {
      const usersRef = this.getCollection("users");
      await setDoc(doc(usersRef, user.email), {
        refreshToken: user.refreshToken,
      });
      if (user.docs) {
        const docRef = collection(doc(usersRef, user.email), "docs");
        for (let i = 0; i < user.docs.length; i++) {
          await setDoc(doc(docRef, user.docs[i].id), {
            content: user.docs[i].markdown,
          });
        }
      }
      logger.info("User added", {user: user.email, docs: user.docs});
    } catch (error) {
      logger.error("Error adding user", {user: user.email});
      throw error;
    }
  }
  static async updateUserDocs(user: Omit<User, "refreshToken">) {
    try {
      const usersRef = this.getCollection("users");
      if (user.docs) {
        const docRef = collection(doc(usersRef, user.email), "docs");
        for (let i = 0; i < user.docs.length; i++) {
          await setDoc(doc(docRef, user.docs[i].id), {
            content: user.docs[i].markdown,
          });
        }
      }
      logger.info("User updated", {user: user.email, docs: user.docs});
    } catch (error) {
      logger.error("Error updating user", {user: user.email});
      throw error;
    }
  }
}
