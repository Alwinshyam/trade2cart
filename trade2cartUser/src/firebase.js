// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth  } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDVfsNR72ILLfOtNlXDpthEHyWZKP3gGPM",
  authDomain: "fir-fd234.firebaseapp.com",
  projectId: "fir-fd234",
  storageBucket: "fir-fd234.appspot.com",
  messagingSenderId: "679137617451",
  appId: "1:679137617451:web:5a09336a12faef4969ec6e",
  measurementId: "G-SVYSRV991M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
