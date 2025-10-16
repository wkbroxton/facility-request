const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID
};

// Initialize Firebase
let db;
try {
    // Check if all required environment variables are present
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        throw new Error("Firebase config is missing. Make sure you have a .env file with your project credentials.");
    }
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
} catch (e) {
    console.error("Firebase initialization error:", e.message);
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert"><strong class="font-bold">Configuration Error!</strong><span class="block sm:inline"> ${e.message}</span></div>`;
    }
}

export { db };