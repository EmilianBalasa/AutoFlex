        // Firebase configuration
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
        const db = firebase.firestore();
        const storage = firebase.storage();

        // Google Auth Provider
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        
        // Facebook Auth Provider
        const facebookProvider = new firebase.auth.FacebookAuthProvider();

        // DOM Elements
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const profileForm = document.getElementById('profile-form');
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        const userTypeOptions = document.querySelectorAll('.user-type-option');
        const providerFields = document.getElementById('provider-fields');
        const continueToProfileBtn = document.getElementById('continue-to-profile');
        const completeSignupBtn = document.getElementById('complete-signup');
        const backToSignupBtn = document.getElementById('back-to-signup');
        const forgotPasswordLink = document.getElementById('forgot-password-link');
        const backToLoginBtn = document.getElementById('back-to-login');
        const googleLoginBtn = document.getElementById('google-login');
        const googleSignupBtn = document.getElementById('google-signup');
        const facebookLoginBtn = document.getElementById('facebook-login');
        const facebookSignupBtn = document.getElementById('facebook-signup');
        const profileImageInput = document.getElementById('profile-image-input');
        const profilePreview = document.getElementById('profile-preview');
        const profileImage = document.querySelector('.profile-image');
        const loading = document.getElementById('loading');
        const notification = document.getElementById('notification');

        // User type (client or provider)
        let userType = 'client';
        
        // Profile image file
        let profileImageFile = null;

        // Event Listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Tab Navigation
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(tc => tc.classList.remove('active'));
                    
                    tab.classList.add('active');
                    const tabId = tab.getAttribute('data-tab');
                    document.getElementById(`${tabId}-tab`).classList.add('active');
                });
            });
            
            // User Type Selection
            userTypeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    userTypeOptions.forEach(o => o.classList.remove('active'));
                    option.classList.add('active');
                    userType = option.getAttribute('data-type');
                    
                    if (userType === 'provider') {
                        providerFields.classList.add('active');
                    } else {
                        providerFields.classList.remove('active');
                    }
                });
            });
            
            // Continue to Profile
            continueToProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Basic form validation
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const confirmPassword = document.getElementById('signup-confirm-password').value;
                const terms = document.getElementById('terms').checked;
                
                if (!email || !password || !confirmPassword) {
                    showNotification('Please fill in all fields', 'error');
                    return;
                }
                
                if (password !== confirmPassword) {
                    showNotification('Passwords do not match', 'error');
                    return;
                }
                
                if (!terms) {
                    showNotification('Please agree to the terms', 'error');
                    return;
                }
                
                // Show profile form
                document.getElementById('signup-step-1').classList.remove('active');
                document.getElementById('signup-step-2').classList.add('active');
                
                // Show provider fields if provider type
                if (userType === 'provider') {
                    providerFields.classList.add('active');
                } else {
                    providerFields.classList.remove('active');
                }
            });
            
            // Back to Signup
            backToSignupBtn.addEventListener('click', () => {
                document.getElementById('signup-step-2').classList.remove('active');
                document.getElementById('signup-step-1').classList.add('active');
            });
            
            // Forgot Password Link
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                tabContents.forEach(tc => tc.classList.remove('active'));
                document.getElementById('forgot-password-tab').classList.add('active');
            });
            
            // Back to Login
            backToLoginBtn.addEventListener('click', () => {
                tabContents.forEach(tc => tc.classList.remove('active'));
                document.getElementById('login-tab').classList.add('active');
            });
            
            // Profile Image Upload
            profileImage.addEventListener('click', () => {
                profileImageInput.click();
            });
            
            profileImageInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    profileImageFile = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        profilePreview.src = e.target.result;
                    };
                    reader.readAsDataURL(profileImageFile);
                }
            });
            
            // Auth Forms
            loginForm.addEventListener('submit', handleLogin);
            profileForm.addEventListener('submit', handleProfileSetup);
            forgotPasswordForm.addEventListener('submit', handleForgotPassword);
            
// Social Login
googleLoginBtn.addEventListener('click', () => signInWithProvider(googleProvider, 'login'));
googleSignupBtn.addEventListener('click', () => signInWithProvider(googleProvider, 'signup'));
facebookLoginBtn.addEventListener('click', () => signInWithProvider(facebookProvider, 'login'));
facebookSignupBtn.addEventListener('click', () => signInWithProvider(facebookProvider, 'signup'));
        });

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // Sign in with email and password
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check if user profile exists
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            // Redirect to appropriate dashboard based on user type
            const userData = userDoc.data();
            redirectToDashboard(userData.userType);
        } else {
            // Profile not completed, redirect to profile setup
            showNotification('Please complete your profile setup', 'error');
            setTimeout(() => {
                document.getElementById('signup-step-1').classList.remove('active');
                document.getElementById('signup-step-2').classList.add('active');
                tabs.forEach(t => t.classList.remove('active'));
                tabs[1].classList.add('active');
                tabContents.forEach(tc => tc.classList.remove('active'));
                document.getElementById('signup-tab').classList.add('active');
            }, 1000);
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification(getAuthErrorMessage(error), 'error');
    } finally {
        showLoading(false);
    }
}

// Profile Setup Handler
async function handleProfileSetup(e) {
    e.preventDefault();
    
    try {
        showLoading(true);
        
        // Get current user
        let user = auth.currentUser;
        
        if (!user) {
            // User not authenticated, try to create account first
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                user = userCredential.user;
            } catch (error) {
                console.error('Signup error:', error);
                showNotification(getAuthErrorMessage(error), 'error');
                showLoading(false);
                return;
            }
        }
        
        // Collect profile data
        const userData = {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            email: user.email,
            userType: userType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add service provider specific fields if applicable
        if (userType === 'provider') {
            userData.businessName = document.getElementById('business-name').value;
            userData.businessDescription = document.getElementById('business-description').value;
            userData.businessHours = document.getElementById('business-hours').value;
            userData.servicesOffered = document.getElementById('services-offered').value;
        }
        
        // Upload profile image if selected
        let profileImageUrl = null;
        if (profileImageFile) {
            const storageRef = storage.ref(`profile_images/${user.uid}`);
            await storageRef.put(profileImageFile);
            profileImageUrl = await storageRef.getDownloadURL();
            userData.profileImage = profileImageUrl;
        }
        
        // Save user data to Firestore
        await db.collection('users').doc(user.uid).set(userData);
        
        // Update user profile
        await user.updateProfile({
            displayName: `${userData.firstName} ${userData.lastName}`,
            photoURL: profileImageUrl
        });
        
        showNotification('Profile created successfully!', 'success');
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
            redirectToDashboard(userType);
        }, 1500);
        
    } catch (error) {
        console.error('Profile setup error:', error);
        showNotification('Error setting up profile. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Forgot Password Handler
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    if (!email) {
        showNotification('Please enter your email', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        await auth.sendPasswordResetEmail(email);
        
        showNotification('Password reset email sent. Check your inbox.', 'success');
        
        setTimeout(() => {
            tabContents.forEach(tc => tc.classList.remove('active'));
            document.getElementById('login-tab').classList.add('active');
        }, 2000);
        
    } catch (error) {
        console.error('Password reset error:', error);
        showNotification(getAuthErrorMessage(error), 'error');
    } finally {
        showLoading(false);
    }
}

// Sign in with provider (Google or Facebook)
async function signInWithProvider(provider, mode) {
    try {
        showLoading(true);
        
        // Sign in with popup
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Check if this is a new user
        const isNewUser = result.additionalUserInfo.isNewUser;
        
        if (isNewUser || mode === 'signup') {
            // Check if profile exists
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                // Pre-fill profile form with information from provider
                document.getElementById('first-name').value = result.additionalUserInfo.profile.given_name || '';
                document.getElementById('last-name').value = result.additionalUserInfo.profile.family_name || '';
                if (result.additionalUserInfo.profile.email) {
                    document.getElementById('signup-email').value = result.additionalUserInfo.profile.email;
                }
                
                // If profile picture available, set it
                if (user.photoURL) {
                    profilePreview.src = user.photoURL;
                }
                
                // Show profile setup form
                tabs.forEach(t => t.classList.remove('active'));
                tabs[1].classList.add('active');
                tabContents.forEach(tc => tc.classList.remove('active'));
                document.getElementById('signup-tab').classList.add('active');
                document.getElementById('signup-step-1').classList.remove('active');
                document.getElementById('signup-step-2').classList.add('active');
                
                showNotification('Please complete your profile setup', 'success');
            } else {
                // Profile exists, redirect to dashboard
                redirectToDashboard(userDoc.data().userType);
            }
        } else {
            // Login mode - check if profile exists
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (userDoc.exists) {
                // Redirect to dashboard
                redirectToDashboard(userDoc.data().userType);
            } else {
                // Profile doesn't exist, show profile setup
                tabs.forEach(t => t.classList.remove('active'));
                tabs[1].classList.add('active');
                tabContents.forEach(tc => tc.classList.remove('active'));
                document.getElementById('signup-tab').classList.add('active');
                document.getElementById('signup-step-1').classList.remove('active');
                document.getElementById('signup-step-2').classList.add('active');
                
                showNotification('Please complete your profile setup', 'success');
            }
        }
    } catch (error) {
        console.error('Social sign-in error:', error);
        showNotification(getAuthErrorMessage(error), 'error');
    } finally {
        showLoading(false);
    }
}

// Redirect to appropriate dashboard
function redirectToDashboard(userType) {
    if (userType === 'client') {
        window.location.href = 'client-dashboard.html';
    } else if (userType === 'provider') {
        window.location.href = 'provider-dashboard.html';
    }
}

// Show loading spinner
function showLoading(show) {
    if (show) {
        loading.classList.add('active');
    } else {
        loading.classList.remove('active');
    }
}

// Show notification
function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Get readable error message from Firebase auth errors
function getAuthErrorMessage(error) {
    switch (error.code) {
        case 'auth/user-not-found':
            return 'No account found with this email';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/email-already-in-use':
            return 'Email already in use';
        case 'auth/weak-password':
            return 'Password is too weak';
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/account-exists-with-different-credential':
            return 'An account already exists with the same email address but different sign-in credentials';
        case 'auth/popup-closed-by-user':
            return 'Sign-in popup was closed before completing the sign-in';
        default:
            return error.message || 'An error occurred. Please try again.';
    }
}

// Auth state observer
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.email);
        
        // Check if the user has completed profile setup
        db.collection('users').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    // User has a profile, update UI or redirect if needed
                    const userData = doc.data();
                    
                    // Redirect if on login page
                    if (window.location.pathname.includes('login.html')) {
                        redirectToDashboard(userData.userType);
                    }
                }
            })
            .catch(error => {
                console.error('Error checking user profile:', error);
            });
    } else {
        // User is signed out
        console.log('User is signed out');
    }
});