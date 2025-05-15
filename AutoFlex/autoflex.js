// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCJXaADkSOQO9CcV2qub7Fwlu9o4OPSPc",
  authDomain: "autoflex-83dba.firebaseapp.com",
  projectId: "autoflex-83dba",
  storageBucket: "autoflex-83dba.firebasestorage.app",
  messagingSenderId: "921645337376",
  appId: "1:921645337376:web:fbd7dfd8fb9ef056e7a545",
  measurementId: "G-DV3KB8X20D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase service instances
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Note: Analytics is initialized but not assigned to a variable here, as it's often used directly
const analytics = getAnalytics(app);

// Use the emulators during development
if (window.location.hostname === "localhost") {
  console.log("Connecting to Firebase emulators...");
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "http://localhost:8080");
  connectStorageEmulator(storage, "http://localhost:9199"); // Default Storage emulator port
}

// Make app, auth, db, storage instances available globally if needed by other scripts
// This is useful if your other scripts (like login.js) are not ES modules.
// If login.js is a module, you should import these there.
window.app = app;
window.auth = auth;
window.db = db;
window.storage = storage;


        // Mobile Menu Toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');

        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });

        // Animation on scroll
        document.addEventListener('DOMContentLoaded', function() {
            const animatedElements = document.querySelectorAll('.animate');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = 1;
                    }
                });
            }, { threshold: 0.1 });
            
            animatedElements.forEach(element => {
                element.style.opacity = 0;
                observer.observe(element);
            });
        });