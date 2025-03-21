import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDu6eyZB0wxjikxUQscABo9o54eRF-SEAY",
  authDomain: "organizer-2.firebaseapp.com",
  projectId: "organizer-2",
  storageBucket: "organizer-2.firebasestorage.app",
  messagingSenderId: "811858648505",
  appId: "1:811858648505:web:1c6b2f6332c89701036a68",
  measurementId: "G-XL3MQQSVSH",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/calendar.events');