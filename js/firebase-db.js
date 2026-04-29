// js/firebase-db.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Fetches all quizzes from the "quizzes" collection where isPublic is true.
 * @returns {Promise<Array>} Array of quiz objects containing their document ID.
 */
export async function getPublicQuizzes() {
    try {
        const quizzesRef = collection(db, "quizzes");
        // Only fetch quizzes marked as public
        const q = query(quizzesRef, where("isPublic", "==", true));
        const querySnapshot = await getDocs(q);
        
        const quizzes = [];
        querySnapshot.forEach((doc) => {
            quizzes.push({ id: doc.id, ...doc.data() });
        });
        
        return quizzes;
    } catch (error) {
        console.error("Error fetching public quizzes:", error);
        throw error; // Pass the error to the frontend so it can update the UI
    }
}

