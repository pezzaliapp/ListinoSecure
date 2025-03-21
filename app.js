// Importa Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
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

// ✅ LOGIN
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault(); // 🔹 EVITA IL RESET DEL FORM

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput.value.trim();  // 🔹 Rimuove spazi bianchi
    const password = passwordInput.value;

    console.log("🔹 Tentativo di login con:", email);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("✅ Login riuscito:", user.email);

        // Controlla l'autorizzazione in Firestore
        const userDocRef = doc(db, "utenti_autorizzati", user.email);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && docSnap.data().autorizzato === true) {
            console.log("✅ Utente autorizzato:", user.email);
            window.location.href = "listino.html"; // 🔹 REINDIRIZZA alla pagina del listino
        } else {
            console.warn("⛔ Utente NON autorizzato:", user.email);
            alert("Accesso non autorizzato.");
            await signOut(auth);
        }
    } catch (error) {
        console.error("❌ Errore login:", error.code, error.message);
        alert("Errore durante il login: " + error.message);
    }
});

// ✅ CONTROLLA LOGIN ATTIVO
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("🔹 Utente autenticato:", user.email);
    } else {
        console.log("❌ Nessun utente autenticato");
    }
});

// ✅ LOGOUT
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    try {
        await signOut(auth);
        console.log("🔹 Logout eseguito.");
        window.location.href = "index.html";
    } catch (error) {
        console.error("❌ Errore logout:", error);
    }
});
