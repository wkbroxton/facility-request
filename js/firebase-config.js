// Initialize Firebase
let db;
try {
    // Check if the firebaseConfig object exists (it will be injected by Netlify on the live site)
    if (typeof firebaseConfig === 'undefined') {
        throw new Error("Firebase config is not defined. It will be injected on the live site.");
    }

    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    
} catch (e) {
    console.error("Firebase initialization error:", e.message);
    // Display an error on the page if Firebase fails to initialize.
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert"><strong class="font-bold">Application Error!</strong><span class="block sm:inline"> Could not connect to the database. Please contact the administrator.</span></div>`;
    }
}

// Export the db instance for app.js to use
export { db };