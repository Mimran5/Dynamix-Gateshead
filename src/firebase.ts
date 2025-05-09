// Replace the below config with your Firebase project config
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCT6djoaILfK_6cXVw3IGkE1QPI0aUccB0",
  authDomain: "dynamix-1decd.firebaseapp.com",
  projectId: "dynamix-1decd",
  storageBucket: "dynamix-1decd.appspot.com",
  messagingSenderId: "675780760207",
  appId: "1:675780760207:web:f12649d4d5745e36c896fa",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 