import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { FIREBASE_CONFIG as config } from "./config";

export default async function firebaseInit() {
  const app = initializeApp(config);
  const db = getFirestore(app);
  return db;
}
