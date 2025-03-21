// Verifichiamo se la variabile globale "firebase" esiste
if (typeof firebase === "undefined") {
  console.error("❌ Firebase non è stato caricato. Controlla di aver incluso i file compat in index.html!");
} else {
  console.log("✅ Firebase compat caricato correttamente.");
}

// Riferimenti ai servizi Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// ------------------------------------
// LOGIN
// ------------------------------------
document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("✅ Login riuscito:", userCredential.user);

      // Salva l'orario di login in localStorage
      localStorage.setItem("loginTime", Date.now());

      // Reindirizza a listino.html
      window.location.href = "listino.html";
    })
    .catch((error) => {
      console.error("❌ Errore login:", error.message);
      document.getElementById("error-message").classList.remove("hidden");
    });
});

// ------------------------------------
// CONTROLLO AUTENTICAZIONE
// ------------------------------------
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("👤 Utente autenticato:", user.email);

    // Controllo se l'utente è autorizzato in Firestore
    db.collection("utenti_autorizzati").doc(user.email).get().then((docSnap) => {
      if (docSnap.exists && docSnap.data().autorizzato) {
        console.log("✅ Accesso autorizzato:", user.email);
      } else {
        console.warn("❌ Accesso negato:", user.email);
        alert("Accesso non autorizzato.");
        auth.signOut();
        window.location.href = "index.html";
      }
    });

    // Sessione valida per 15 giorni
    const loginTime = localStorage.getItem("loginTime");
    if (loginTime && (Date.now() - loginTime) > (15 * 24 * 60 * 60 * 1000)) {
      console.log("⚠️ Sessione scaduta!");
      auth.signOut();
    }
  } else {
    console.log("🔓 Nessun utente autenticato.");
    // Protezione: se qualcuno apre listino.html senza essere loggato
    if (window.location.pathname.includes("listino.html")) {
      window.location.href = "index.html";
    }
  }
});

// ------------------------------------
// LOGOUT
// ------------------------------------
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  auth.signOut().then(() => {
    console.log("🚪 Logout effettuato");
    window.location.href = "index.html";
  });
});

// ------------------------------------
// CARICA LISTINO
// ------------------------------------
async function caricaListino() {
  const user = auth.currentUser;
  if (!user) {
    console.log("🔴 Utente non autenticato, impossibile caricare il listino.");
    return;
  }

  // Legge il documento "listino_2025" nella collezione "listini"
  const docRef = db.collection("listini").doc("listino_2025");
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    console.log("📋 Dati del listino:", docSnap.data());
    mostraListino(docSnap.data().prodotti);
  } else {
    console.log("❌ Nessun listino trovato.");
  }
}

// ------------------------------------
// MOSTRA LISTINO IN TABELLA
// ------------------------------------
function mostraListino(prodotti) {
  const tableBody = document.getElementById("listino-table");
  if (!tableBody) return;
  
  tableBody.innerHTML = "";
  prodotti.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.codice}</td><td>${item.descrizione}</td><td>${item.prezzo} €</td>`;
    tableBody.appendChild(row);
  });
}

// ------------------------------------
// SE SIAMO SU listino.html, CARICA I DATI
// ------------------------------------
if (window.location.pathname.includes("listino.html")) {
  caricaListino();
}
