import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithCustomToken,
  updateProfile,
  initializeAuth,
  // @ts-ignore
  getReactNativePersistence,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GOOGLE_CLIENT_ID =
  '972583680950-7ang94u09kol0u5f5sndskkcr913nqc2.apps.googleusercontent.com';

export const GOOGLE_WEB_CLIENT_ID = GOOGLE_CLIENT_ID;
export const GOOGLE_OAUTH_CLIENT_ID = GOOGLE_CLIENT_ID;

export const firebaseConfig = {
  apiKey: 'AIzaSyALogd47c0ZlzLQNX-Uw03V7HZsea4lDjY',
  authDomain: 'auth-checker-diva.firebaseapp.com',
  projectId: 'auth-checker-diva',
  storageBucket: 'auth-checker-diva.firebasestorage.app',
  messagingSenderId: '972583680950',
  appId:
    Platform.OS === 'android'
      ? '1:972583680950:android:1acf4d8ff8331adc205f17'
      : '1:972583680950:web:207e65c929b731f0205f17',
};


// Initialize Firebase App
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with React Native persistence to prevent NO_PERSISTENCE_WARNING
let authInstance: Auth;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  authInstance = getAuth(app);
}

export const auth: Auth = authInstance;



// Initialize Cloud Firestore lazily on demand to avoid background connection warnings if database is not created yet
let firestoreInstance: Firestore | null = null;
export const getDb = (): Firestore => {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
};

export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  FirebaseUser,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithCustomToken,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
};
