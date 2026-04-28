// Import Firebase SDKs (v10.x.x Modular via CDN)
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

// YOUR FIREBASE CONFIGURATION GOES HERE
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DOM Elements ---
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
        if(authError) authError.style.display = 'none';

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Save role and extra info to Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                role: role,
                createdAt: new Date().toISOString()
            });

            // 3. Redirect to Dashboard
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
        if(authError) authError.style.display = 'none';

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
// This observes the user state across all pages where this script is loaded
onAuthStateChanged(auth, async (user) => {
    const currentPath = window.location.pathname;
    const isDashboardPage = currentPath.includes('dashboard.html');
    const isAuthPage = currentPath.includes('login.html') || currentPath.includes('signup.html');

    if (user) {
        // User IS logged in
        if (isAuthPage) {
            window.location.href = 'dashboard.html'; 
        }

        if (isDashboardPage) {
            try {
                // Fetch user data from Firestore
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    
                    // Update Dashboard UI
                    const nameDisplay = document.getElementById('userNameDisplay');
                    const roleDisplay = document.getElementById('userRoleDisplay');
                    
                    if (nameDisplay) nameDisplay.textContent = `Welcome, ${userData.name}!`;
                    if (roleDisplay) roleDisplay.textContent = `Role: ${userData.role}`;

                    // Toggle menus based on role
                    if (userData.role === 'teacher') {
                        document.getElementById('teacherMenu').style.display = 'block';
                        document.getElementById('studentMenu').style.display = 'none';
                    } else if (userData.role === 'student') {
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
        // User IS NOT logged in
        if (isDashboardPage || currentPath.includes('create.html')) {
            window.location.href = 'login.html'; // Kick them back to login if trying to access protected pages
        }
    }
});
