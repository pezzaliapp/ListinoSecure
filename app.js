// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// 🔐 Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBAqx_T4TTyQhHJxdpBOljl74vXVJ61Inc",
  authDomain: "listino-e8852.firebaseapp.com",
  projectId: "listino-e8852",
  storageBucket: "listino-e8852.appspot.com",
  messagingSenderId: "928462463806",
  appId: "1:928462463806:web:bd55e36b68254ea1e4c26f"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔑 Login con email e password
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        window.location.href = "listino.html";
      })
      .catch((error) => {
        alert("Login fallito. Controlla le credenziali.");
        console.error("Errore login:", error);
      });
  });
}

// 📥 Caricamento listino da listino.json SOLO per utenti autorizzati
const listinoBody = document.getElementById("listino-body");
const logoutBtn = document.getElementById("logout");

if (listinoBody) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docRef = doc(db, "utenti_autorizzati", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().autorizzato === true) {
        fetch("listino.json")
          .then(res => res.json())
          .then(data => {
            data.forEach(item => {
              const row = document.createElement("tr");
              row.innerHTML = `
                <td>${item.codice}</td>
                <td>${item.descrizione}</td>
                <td>${item.prezzo} €</td>
              `;
              listinoBody.appendChild(row);
            });
          })
          .catch(err => {
            console.error("Errore nel caricamento del listino:", err);
          });
      } else {
        alert("Utente non autorizzato.");
        window.location.href = "index.html";
      }
    } else {
      window.location.href = "index.html";
    }
  });
}

// 🚪 Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  });
}
