
import { initializeApp, getApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDgG4JT-JJRRTAu0TgIHA6Ie6FwNrplITU",
  authDomain: "shopmate-wl9jo.firebaseapp.com",
  projectId: "shopmate-wl9jo",
  storageBucket: "shopmate-wl9jo.appspot.com",
  messagingSenderId: "633180331933",
  appId: "1:633180331933:web:6b2de168167513b3e11974"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export default app;
