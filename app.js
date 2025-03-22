// Firebase CDN (inseriti direttamente in index.html o listino.html)
// <script src="https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js"></script>

// ⚙️ Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBAqx_T4TTyQhHJxdpBOljl74vXVJ61Inc",
  authDomain: "listino-e8852.firebaseapp.com",
  projectId: "listino-e8852",
  storageBucket: "listino-e8852.appspot.com",
  messagingSenderId: "928462463806",
  appId: "1:928462463806:web:bd55e36b68254ea1e4c26f"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log("✅ Firebase inizializzato");

// 🎯 LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    console.log("🔑 Tentativo login con:", email);

    auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        console.log("✅ Login riuscito:", userCredential.user.email);

        // Salvo l'email localmente
        localStorage.setItem("utenteEmail", email);

        // Vai a listino
        window.location.href = "listino.html";
      })
      .catch(error => {
        console.error("❌ Errore login:", error.message);
        alert("Errore login: " + error.message);
      });
  });
}

// 🔐 LISTINO: Verifica autorizzazione
if (window.location.pathname.includes("listino.html")) {
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log("👤 Utente autenticato:", user.email);

      const docRef = db.collection("utenti_autorizzati").doc(user.email);
      console.log("🔍 Cerco doc Firestore con ID:", user.email);

      docRef.get().then(docSnap => {
        if (docSnap.exists) {
          const data = docSnap.data();
          console.log("📄 docSnap:", data);

          if (data.autorizzato === true) {
            console.log("✅ Utente autorizzato");

            // Carica listino
            db.collection("listini").get().then(snapshot => {
              const table = document.getElementById("listino-table");
              snapshot.forEach(doc => {
                const item = doc.data();
                const row = document.createElement("tr");
                row.innerHTML = `
                  <td>${item.codice || ""}</td>
                  <td>${item.descrizione || ""}</td>
                  <td>${item.prezzo || ""}</td>
                `;
                table.appendChild(row);
              });
            });
          } else {
            console.warn("⛔ Non autorizzato:", user.email);
            alert("Accesso non autorizzato.");
            window.location.href = "index.html";
          }
        } else {
          console.warn("📛 docSnap: Non esiste in Firestore");
          alert("Accesso non autorizzato.");
          window.location.href = "index.html";
        }
      });
    } else {
      console.warn("🔒 Nessun utente autenticato.");
      window.location.href = "index.html";
    }
  });

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.signOut().then(() => {
        console.log("👋 Logout effettuato");
        window.location.href = "index.html";
      });
    });
  }
}
