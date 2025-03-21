// Inizializza Firebase (assicurati che Firebase sia incluso in index.html)
const firebaseConfig = {
  apiKey: "AIzaSyBAqx_T4TTyQhHJxdpBOljl74vXVJ61Inc",
  authDomain: "listino-e8852.firebaseapp.com",
  projectId: "listino-e8852",
  storageBucket: "listino-e8852.firebasestorage.app",
  messagingSenderId: "928462463806",
  appId: "1:928462463806:web:bd55e36b68254ea1e4c26f"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 🔐 Login
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("✅ Login riuscito:", userCredential.user);

      // Salva la data di accesso in localStorage
      localStorage.setItem("loginTime", Date.now());

      // Reindirizza alla pagina listino
      window.location.href = "listino.html";
    })
    .catch((error) => {
      console.error("❌ Errore login:", error.message);
      document.getElementById("error-message").classList.remove("hidden");
    });
});

// 🔐 Controllo stato autenticazione
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("👤 Utente autenticato:", user.email);

    // Controlla se l'utente è autorizzato in Firestore
    db.collection("utenti_autorizzati").doc(user.email).get().then((doc) => {
      if (doc.exists && doc.data().autorizzato) {
        console.log("✅ Accesso autorizzato.");
      } else {
        console.warn("❌ Accesso negato:", user.email);
        alert("Accesso non autorizzato.");
        auth.signOut();
        window.location.href = "index.html"; // Rimanda al login
      }
    });

    // Controlla se sono passati più di 15 giorni
    const loginTime = localStorage.getItem("loginTime");
    if (loginTime && (Date.now() - loginTime) > 15 * 24 * 60 * 60 * 1000) {
      console.log("⚠️ Sessione scaduta!");
      auth.signOut();
    }
  } else {
    console.log("🔓 Nessun utente autenticato.");
    if (window.location.pathname.includes("listino.html")) {
      window.location.href = "index.html"; // Protezione per accesso diretto
    }
  }
});

// 🔐 Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  auth.signOut().then(() => {
    console.log("🚪 Logout effettuato");
    window.location.href = "index.html";
  });
});

// 📦 Funzione per caricare il listino da Firestore
async function caricaListino() {
  const user = auth.currentUser;
  if (!user) {
    console.log("🔴 Utente non autenticato, impossibile caricare il listino.");
    return;
  }

  const docRef = db.collection("listini").doc("listino_2025");
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    console.log("📋 Dati del listino:", docSnap.data());
    mostraListino(docSnap.data().prodotti);
  } else {
    console.log("❌ Nessun listino trovato.");
  }
}

// 📊 Funzione per mostrare il listino in tabella
function mostraListino(prodotti) {
  const tableBody = document.getElementById("listino-table");
  tableBody.innerHTML = "";

  prodotti.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.codice}</td><td>${item.descrizione}</td><td>${item.prezzo} €</td>`;
    tableBody.appendChild(row);
  });
}

// 📌 Se siamo su listino.html, carica i dati
if (window.location.pathname.includes("listino.html")) {
  caricaListino();
}
