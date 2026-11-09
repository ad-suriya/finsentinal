
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Fin Sentinel Firebase configuration. The project ID is the existing Firebase project name.
const firebaseConfig = {
  apiKey: "AIzaSyDd7nLiwQepv1Im1YPcJ83GiR_4ZD_KDV4",
  authDomain: "privacyguard-a171e.firebaseapp.com",
  projectId: "privacyguard-a171e",
  storageBucket: "privacyguard-a171e.firebasestorage.app",
  messagingSenderId: "840042233438",
  appId: "1:840042233438:web:f57c0e156ecf81b66a3ecf",
  measurementId: "G-WPHV4CV79W"
};

// Initialize Firebase Instance
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
const db = getFirestore(app);

export { db };
