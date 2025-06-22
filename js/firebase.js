// =================================================================
// ARCHIVO: js/firebase.js (¡NUEVO ARCHIVO!)
// RESPONSABILIDAD: Inicializar Firebase y exportar los servicios.
// =================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCyxCW_rfI0eUnxy5dJojOCzCEa_JX85YI",
  authDomain: "academia-mitica.firebaseapp.com",
  projectId: "academia-mitica",
  storageBucket: "academia-mitica.firebasestorage.app",
  messagingSenderId: "423081540506",
  appId: "1:423081540506:web:5d5a0c699889628c7c5823"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios para que otros módulos puedan usarlos
export const auth = getAuth(app);
export const db = getFirestore(app);