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
  '160660053649-1ar8vvfbirn6jgd9bnukihvk0frgluv6.apps.googleusercontent.com';

export const GOOGLE_WEB_CLIENT_ID = GOOGLE_CLIENT_ID;
export const GOOGLE_OAUTH_CLIENT_ID = GOOGLE_CLIENT_ID;

export const firebaseConfig = {
  apiKey: 'AIzaSyC1hipp0dBNuKNRcT11fb-yj9KHZjFAQdE',
  authDomain: 'auth-checker-1-main.firebaseapp.com',
  projectId: 'auth-checker-1-main',
  storageBucket: 'auth-checker-1-main.firebasestorage.app',
  messagingSenderId: '160660053649',
  appId:
    Platform.OS === 'android'
      ? '1:160660053649:android:1acf4d8ff8331adc205f17'
      : '1:160660053649:web:3133a668cc3085163e6930',
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
