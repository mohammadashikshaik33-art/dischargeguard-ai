
// Configuration values used across the DischargeGuard application



// =========================
// Firebase Project Settings
// =========================

const firebaseProjectConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcd1234ef5678"
};


// =========================
// Initialize Firebase
// =========================

//firebase.initializeApp(firebaseProjectConfig);

//const firestoreDatabase =
  //  firebase.firestore();

//const firebaseAuthentication =
   // firebase.auth();


// =========================
// Gemini AI Configuration
// =========================

const geminiApiKey =
    "AIzaSyD_KrgSYrlgqFRZ1n_hUgIdqfBtGWG6Eqc";
const geminiApiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";