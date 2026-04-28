// --- FIREBASE IMPORTS (CDN VERSION FOR BROWSER) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// --- YOUR FIREBASE CONFIG (UPDATED) ---
const firebaseConfig = {
  apiKey: "AIzaSyBdPF2V0ismtFTQ1XtAE5XxcKoSDuoI7fo",
  authDomain: "testeract-quiz.firebaseapp.com",
  projectId: "testeract-quiz",
  storageBucket: "testeract-quiz.appspot.com",
  messagingSenderId: "748180455770",
  appId: "1:748180455770:web:ef5831a9191cc8efee7363"
};

// --- INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DOM ELEMENTS ---
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const authError = document.getElementById('authError');

function showError(msg) {
    if (authError) {
        authError.textContent = msg;
        authError.style.display = 'block';
    } else {
        alert(msg);
    }
}

// --- SIGN UP LOGIC ---
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('signupBtn');
        btn.textContent = 'Signing up...';
        btn.disabled = true;

        if (authError) authError.style.display = 'none';

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                role: role,
                createdAt: new Date().toISOString()
            });

            window.location.href = 'dashboard.html';
        } catch (error) {
            showError(error.message);
            btn.textContent = 'Sign Up';
            btn.disabled = false;
        }
    });
}

// --- LOGIN LOGIC ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('loginBtn');
        btn.textContent = 'Logging in...';
        btn.disabled = true;

        if (authError) authError.style.display = 'none';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            showError("Invalid email or password.");
            btn.textContent = 'Login';
            btn.disabled = false;
        }
    });
}

// --- LOGOUT LOGIC ---
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            window.location.href = '../index.html';
        } catch (error) {
            console.error("Error signing out:", error);
        }
    });
}

// --- AUTH STATE & ROLE-BASED UI LOGIC ---
onAuthStateChanged(auth, async (user) => {
    const currentPath = window.location.pathname;
    const isDashboardPage = currentPath.includes('dashboard.html');
    const isAuthPage = currentPath.includes('login.html') || currentPath.includes('signup.html');

    if (user) {
        // If already logged in and on login/signup → redirect
        if (isAuthPage) {
            window.location.href = 'dashboard.html'; 
        }

        if (isDashboardPage) {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();

                    const nameDisplay = document.getElementById('userNameDisplay');
                    const roleDisplay = document.getElementById('userRoleDisplay');

                    if (nameDisplay) {
                        nameDisplay.textContent = `Welcome, ${userData.name}!`;
                    }

                    if (roleDisplay) {
                        roleDisplay.textContent = `Role: ${userData.role}`;
                    }

                    // Role-based UI toggle
                    if (userData.role === 'teacher') {
                        document.getElementById('teacherMenu').style.display = 'block';
                        document.getElementById('studentMenu').style.display = 'none';
                    } else {
                        document.getElementById('teacherMenu').style.display = 'none';
                        document.getElementById('studentMenu').style.display = 'block';
                    }
                } else {
                    console.error("No user document found in Firestore!");
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        }
    } else {
        // Not logged in → protect pages
        if (isDashboardPage || currentPath.includes('create.html')) {
            window.location.href = 'login.html';
        }
    }
});
