import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCr3aUeZPOPUtPFCahh2wIC1FFDOJfzNI",
  authDomain: "gedu-scheduler.firebaseapp.com",
  projectId: "gedu-scheduler",
  storageBucket: "gedu-scheduler.firebasestorage.app",
  messagingSenderId: "752830316413",
  appId: "1:752830316413:web:a23616dced776f422ed614",
  measurementId: "G-4XTQKJEGVC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 