import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBlsdxEdBH_PWHRgKS0W4JUePCsKLtXR-Y",
    authDomain: "beatmaster-1111.firebaseapp.com",
    projectId: "beatmaster-1111",
    storageBucket: "beatmaster-1111.firebasestorage.app",
    messagingSenderId: "911665283954",
    appId: "1:911665283954:web:34e009bd42d2e1d3b5d3eb",
    measurementId: "G-XLPNDGJBE2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with long polling (fixes connection issues on physical devices in Expo Go)
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

export { db };

