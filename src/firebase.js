// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBffKAE7W8ZjxtOKTgtPTSAHDaMMATjUwM",
  authDomain: "canape-album-66f39.firebaseapp.com",
  projectId: "canape-album-66f39",
  storageBucket: "canape-album-66f39.appspot.com",
  messagingSenderId: "876944555891",
  appId: "1:876944555891:web:96a6bc5360191b80434f06",
  measurementId: "G-LW2MZ2FJXG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Exports
export { app, analytics, db, auth };
