// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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

// Protezione di listino.html: se l'utente non è loggato, torna al login
onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname.includes("listino.html")) {
    window.location.href = "index.html"; // Rimanda al login
  }
});

// Gestione login
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Login riuscito:", user);

      // Salva data di accesso in localStorage
      localStorage.setItem("loginTime", Date.now());

      // Reindirizza alla pagina listino
      window.location.href = "listino.html";
    })
    .catch((error) => {
      console.error("Errore login:", error);
      document.getElementById("error-message").classList.remove("hidden");
    });
});

// Controllo stato autenticazione
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Utente autenticato:", user);

    // Controlla se sono passati più di 15 giorni
    const loginTime = localStorage.getItem("loginTime");
    if (loginTime && (Date.now() - loginTime) > 15 * 24 * 60 * 60 * 1000) {
      console.log("Sessione scaduta!");
      signOut(auth);
    }
  } else {
    console.log("Nessun utente autenticato.");
  }
});

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  signOut(auth).then(() => {
    console.log("Logout effettuato");
    window.location.href = "index.html";
  });
});

// Funzione per leggere il listino da Firestore
async function caricaListino() {
  const user = auth.currentUser;
  if (!user) {
    console.log("Utente non autenticato, impossibile caricare il listino.");
    return;
  }

  const docRef = doc(db, "listini", "listino_2025");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Dati del listino:", docSnap.data());
    mostraListino(docSnap.data().prodotti);
  } else {
    console.log("Nessun listino trovato.");
  }
}

// Funzione per mostrare il listino in tabella
function mostraListino(prodotti) {
  const tableBody = document.getElementById("listino-table");
  tableBody.innerHTML = "";

  prodotti.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.codice}</td><td>${item.descrizione}</td><td>${item.prezzo} €</td>`;
    tableBody.appendChild(row);
  });
}

// Se siamo su listino.html, carica i dati
if (window.location.pathname.includes("listino.html")) {
  caricaListino();
}
