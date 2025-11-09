# Firebase Security Rules Setup Guide

## Background
The search functionality in AutoFlex has been enhanced to search across provider-added services, but we encountered a Firebase permissions error:
```
FirebaseError: Missing or insufficient permissions
```

This guide will help you fix this issue by deploying proper security rules to Firebase.

## Step 1: Install Firebase CLI
```powershell
npm install -g firebase-tools
```

## Step 2: Login to Firebase
```powershell
firebase login
```

## Step 3: Initialize Firebase in your project (if not already initialized)
```powershell
cd C:\xampp\htdocs\AutoFlex\AutoFlex
firebase init
```
- Select Firestore and Hosting features
- Use existing project (select autoflex-83dba)
- Accept default options for database rules
- When asked about the public directory, enter "." (dot)
- Configure as a single-page app: No

## Step 4: Deploy the Firestore rules
The security rules are already created in `firestore.rules`. Review them:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to services collection
    match /services/{document=**} {
      allow read: if true; // Anyone can read services
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Other collections have more strict access
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Deploy these rules with:
```powershell
firebase deploy --only firestore:rules
```

## Alternative: Firebase Console Setup
If you prefer using the Firebase Console directly:

1. Go to https://console.firebase.google.com/
2. Select your project (autoflex-83dba)
3. Navigate to Firestore Database > Rules
4. Replace the rules with those from firestore.rules
5. Click "Publish"

## Important Notes
- The app has already been modified to fall back to mock data when Firebase permissions fail
- Once security rules are properly deployed, the app will use real Firebase data
