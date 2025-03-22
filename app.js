/*
  Assicurati di aver creato il progetto con:
  - Authentication abilitata
  - Provider "Accesso anonimo" attivo (Firebase Console -> Authentication -> Sign-in method -> Anonimo)
*/

// 1) Inizializza Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBAqx_T4TTyQhHJxdpBOljl74vXVJ61Inc",
  authDomain: "listino-e8852.firebaseapp.com",
  projectId: "listino-e8852",
  storageBucket: "listino-e8852.appspot.com",
  messagingSenderId: "928462463806",
  appId: "1:928462463806:web:bd55e36b68254ea1e4c26f"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// 2) Login Anonimo
const anonLoginBtn = document.getElementById("anonLoginBtn");
if (anonLoginBtn) {
  anonLoginBtn.addEventListener("click", () => {
    console.log("🔐 Tentativo login anonimo");
    auth.signInAnonymously()
      .then(() => {
        console.log("✅ Login anonimo riuscito");
        window.location.href = "listino.html";
      })
      .catch(err => {
        console.error("❌ Errore login anonimo:", err.message);
        document.getElementById("error-message")?.classList.remove("hidden");
      });
  });
}

// 3) Verifica utente su listino.html
if (window.location.pathname.includes("listino.html")) {
  auth.onAuthStateChanged(user => {
    if (user) {
      if (user.isAnonymous) {
        console.log("👤 Utente anonimo loggato. Carico listino...");
        caricaListino();
      } else {
        // (nel tuo caso potresti controllare docSnap per mail, ma adesso non servono pass e mail)
        console.log("👤 Utente loggato con email:", user.email);
        caricaListino();
      }
    } else {
      console.log("⛔ Nessun utente loggato. Torno a index");
      window.location.href = "index.html";
    }
  });

  // 4) Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.signOut().then(() => {
        console.log("👋 Logout");
        window.location.href = "index.html";
      });
    });
  }
}

// 5) Funzione per caricare il listino
function caricaListino() {
  db.collection("listini").get()
    .then(snapshot => {
      const tableBody = document.getElementById("listino-table");
      snapshot.forEach(doc => {
        const data = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${data.codice || ""}</td>
          <td>${data.descrizione || ""}</td>
          <td>${data.prezzo || ""}</td>
        `;
        tableBody.appendChild(row);
      });
      console.log("✅ Listino caricato");
    })
    .catch(err => {
      console.error("❌ Errore caricamento listino:", err.message);
    });
}
