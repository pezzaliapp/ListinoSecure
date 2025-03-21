// Importa le librerie di Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBAqx_T4TTyQhHJxdpBOljl74vXVJ61Inc",
  authDomain: "listino-e8852.firebaseapp.com",
  projectId: "listino-e8852",
  storageBucket: "listino-e8852.firebasestorage.app",
  messagingSenderId: "928462463806",
  appId: "1:928462463806:web:bd55e36b68254ea1e4c26f"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Utente autenticato:", user.email);

      // Verifica autorizzazione su Firestore
      const userRef = doc(db, "utenti_autorizzati", user.email);
      console.log("Cerco doc Firestore con ID:", user.email);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        console.log("docSnap trovato:", docSnap.data());
        if (docSnap.data().autorizzato) {
          console.log("Accesso autorizzato");
          localStorage.setItem("utente", user.email);
          window.location.href = "listino.html";
        } else {
          console.error("Utente non autorizzato");
          alert("Accesso non autorizzato.");
        }
      } else {
        console.error("docSnap: Non esiste in Firestore");
        alert("Accesso negato: utente non trovato nel database.");
      }
    } catch (error) {
      console.error("Errore login:", error.message);
      alert("Errore login: " + error.message);
    }
  });
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      console.log("Utente disconnesso");
      localStorage.removeItem("utente");
      window.location.href = "index.html";
    }).catch((error) => {
      console.error("Errore logout:", error.message);
    });
  });
}

// Verifica stato utente
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Utente loggato:", user.email);
  } else {
    console.log("Nessun utente autenticato.");
    if (window.location.pathname.includes("listino.html")) {
      window.location.href = "index.html";
    }
  }
});
