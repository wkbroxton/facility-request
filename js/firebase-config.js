// Paste your Firebase project's configuration object here
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db;
try {
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
} catch (e) {
    console.error("Firebase initialization error. Please add your Firebase config.", e);
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert"><strong class="font-bold">Configuration Error!</strong><span class="block sm:inline"> Firebase is not configured. Please add your project credentials to js/firebase-config.js.</span></div>`;
    }
}

export { db };
