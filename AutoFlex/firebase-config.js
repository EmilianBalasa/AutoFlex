// Firebase configuration and authentication
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Check authentication state and update UI
auth.onAuthStateChanged((user) => {
    const userSection = document.getElementById('userSection');
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (user) {
        // User is signed in
        loginBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        
        // Set profile picture with improved error handling
        if (user.photoURL) {
            console.log("Setting profile picture from Google:", user.photoURL);
            const proxyURL = user.photoURL.replace('s96', 's400');
            profileAvatar.src = proxyURL;
            
            profileAvatar.onerror = function() {
                console.error("Failed to load Google profile image, trying original");
                this.src = user.photoURL;
                this.onerror = function() {
                    console.error("Failed to load original, using placeholder");
                    this.src = '/api/placeholder/40/40';
                };
            };
        } else {
            profileAvatar.src = '/api/placeholder/40/40';
        }
    } else {
        // User is signed out
        loginBtn.style.display = 'block';
        userProfile.style.display = 'none';
    }
});

// Mobile menu toggle for autoflex page
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
});
