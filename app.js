// Firebase setup
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBAqx_T4TTyQhHJxdpBOljl74vXVJ61Inc",
  authDomain: "listino-e8852.firebaseapp.com",
  projectId: "listino-e8852",
  storageBucket: "listino-e8852.appspot.com",
  messagingSenderId: "928462463806",
  appId: "1:928462463806:web:bd55e36b68254ea1e4c26f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check autorizzazione su Firestore
    const userDocRef = doc(db, "utenti_autorizzati", user.email);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().autorizzato === true) {
      localStorage.setItem("user", user.email);
      window.location.href = "listino.html";
    } else {
      alert("Accesso non autorizzato.");
      await signOut(auth);
    }
  } catch (error) {
    console.error("Errore di login:", error);
    alert("Credenziali errate o utente non autorizzato.");
  }
});

// Logout
document.getElementById('logout')?.addEventListener('click', () => {
  signOut(auth).then(() => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });
});
