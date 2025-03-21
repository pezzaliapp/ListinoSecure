// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAqx_T4TTyQhHJxdpBOljl74vXVJ61Inc",
  authDomain: "listino-e8852.firebaseapp.com",
  projectId: "listino-e8852",
  storageBucket: "listino-e8852.firebasestorage.app",
  messagingSenderId: "928462463806",
  appId: "1:928462463806:web:bd55e36b68254ea1e4c26f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Login function
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Utente autenticato:", userCredential.user.email);

    // Check Firestore authorization
    const userDocRef = doc(db, "utenti_autorizzati", email);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      console.log("Accesso autorizzato", email);
      localStorage.setItem("user", email);
      window.location.href = "listino.html";
    } else {
      console.error("Accesso negato: l'utente non è autorizzato in Firestore");
      alert("Accesso non autorizzato.");
      signOut(auth);
    }
  } catch (error) {
    console.error("Errore login:", error.message);
    alert("Errore login: " + error.message);
  }
});

// Logout function
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.removeItem("user");
  window.location.href = "index.html";
});

// Protect listino.html page
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("Nessun utente autenticato. Reindirizzamento a index.html");
    window.location.href = "index.html";
  } else {
    console.log("Utente autenticato:", user.email);
    
    // Check authorization again
    const userDocRef = doc(db, "utenti_autorizzati", user.email);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      console.log("docSnap: Non esiste in Firestore");
      alert("Accesso non autorizzato.");
      await signOut(auth);
      window.location.href = "index.html";
    }
  }
});
