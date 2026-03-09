import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChRMzrT-nv1ozsXIlEr68I1prWNiHGBss",
  authDomain: "bingo-f6f25.firebaseapp.com",
  projectId: "bingo-f6f25",
  storageBucket: "bingo-f6f25.firebasestorage.app",
  messagingSenderId: "272828884330",
  appId: "1:272828884330:web:1bb8f76e4b23ae59d83113",
  measurementId: "G-K7ETCZJD3D"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();