// =====================================================================
// CrowdMix — Configuración de Firebase
// -----------------------------------------------------------------------
// 1. Crea un proyecto gratis en https://console.firebase.google.com
// 2. Activa "Firestore Database" (modo producción) y "Authentication"
//    → método "Anónimo".
// 3. En Configuración del proyecto → tus apps → app web, copia el
//    objeto de configuración y pégalo abajo, reemplazando los valores
//    de ejemplo.
// 4. Sube las reglas de seguridad incluidas en firestore.rules desde
//    Firestore → Reglas.
//
// Todo el detalle paso a paso está en README.md.
// =====================================================================

export const firebaseConfig = {
  apiKey: "AIzaSyBmB4V5xZ2Bx9CWXT6W2B2b0DlXGz2m1Tk",
  authDomain: "pedidosdj-3d25c.firebaseapp.com",
  databaseURL: "https://pedidosdj-3d25c-default-rtdb.firebaseio.com",
  projectId: "pedidosdj-3d25c",
  storageBucket: "pedidosdj-3d25c.firebasestorage.app",
  messagingSenderId: "544956681786",
  appId: "1:544956681786:web:c521d45c62249d88e5af03"
};