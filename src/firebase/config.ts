// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAl2NvSDYCfeb1atqhmYYEiLtHzXUbUBlw",
  authDomain: "chat-app-34c05.firebaseapp.com",
  projectId: "chat-app-34c05",
  storageBucket: "chat-app-34c05.firebasestorage.app",
  messagingSenderId: "462782857217",
  appId: "1:462782857217:web:8d81675f6efe57ea360000",
  measurementId: "G-1Q427LRE5T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;