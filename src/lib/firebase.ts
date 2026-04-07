import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDdm0Wa80oyqJncDc8ySKzY48hxq753Sbk',
  authDomain: 'sentinel-a7d96.firebaseapp.com',
  databaseURL: 'https://sentinel-a7d96-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'sentinel-a7d96',
  storageBucket: 'sentinel-a7d96.firebasestorage.app',
  messagingSenderId: '663895007206',
  appId: '1:663895007206:web:e39284475449d4cb750027',
  measurementId: 'G-8E5V5QTQ5K'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

/**
 * Handle User Registration
 * Stores additional metadata (role, name, dept, image) in Realtime Database
 */
export const handleRegister = async (email: string, password: string, metadata: { name: string, role: string, department: string, imageUrl: string }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save to Realtime Database
    await set(ref(db, `users/${user.uid}`), {
      uid: user.uid,
      email,
      ...metadata,
      createdAt: new Date().toISOString()
    });

    return { user, success: true };
  } catch (error: any) {
    console.error('Registration Error:', error.message);
    throw error;
  }
};

/**
 * Handle User Login
 * Retrieves metadata from RTDB after Auth success
 */
export const handleLogin = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch profile from RTDB
    const snapshot = await get(ref(db, `users/${user.uid}`));
    if (snapshot.exists()) {
      return { user, profile: snapshot.val(), success: true };
    }
    
    return { user, profile: null, success: true };
  } catch (error: any) {
    console.error('Login Error:', error.message);
    throw error;
  }
};

export { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut };
