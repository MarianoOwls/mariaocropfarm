import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_Tj4jiTwwBTrfl5fZiomRTq0d6eYNy-c",
  authDomain: "mariano-crop-farm-bot.firebaseapp.com",
  projectId: "mariano-crop-farm-bot",
  storageBucket: "mariano-crop-farm-bot.firebasestorage.app",
  messagingSenderId: "367962353139",
  appId: "1:367962353139:web:1da1043fc39a0d6f5af686",
  measurementId: "G-8WYYCM4HE6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };