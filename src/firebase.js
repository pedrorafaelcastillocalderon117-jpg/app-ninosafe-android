import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKAhkNSvxQjtljohLR70q7xH7uskeyOvM",
  authDomain: "stefni-3208d.firebaseapp.com",
  projectId: "stefni-3208d",
  storageBucket: "stefni-3208d.firebasestorage.app",
  messagingSenderId: "423111055560",
  appId: "1:423111055560:web:3a205d95a62801c1cd2dfd",
  measurementId: "G-EBCN9K25HT"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos el servicio de Autenticación para usarlo en la app
export const auth = getAuth(app);
