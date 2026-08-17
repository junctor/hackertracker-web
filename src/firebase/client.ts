import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
  authDomain: "junctor-hackertracker.firebaseapp.com",
  projectId: "junctor-hackertracker",
  storageBucket: "junctor-hackertracker.appspot.com",
  messagingSenderId: "552364409858",
  appId: "1:552364409858:web:ceb163b5ca77ebe00d131b",
  measurementId: "G-JSP9RM82KG",
};

const app = getApps()[0] ?? initializeApp(firebaseConfig);

export const db = getFirestore(app);
