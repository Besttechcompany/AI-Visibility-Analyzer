// js/firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2wAEJijbjBz71K34-J8G1Tt5wNCJo0AE",
  authDomain: "ai-visibility-analyzer-72ad6.firebaseapp.com",
  projectId: "ai-visibility-analyzer-72ad6",
  storageBucket: "ai-visibility-analyzer-72ad6.firebasestorage.app",
  messagingSenderId: "713238610437",
  appId: "1:713238610437:web:fb022e44a97a1a0945526c",
  measurementId: "G-7FWXM0900F"
};

const app = initializeApp(firebaseConfig);

export { app };