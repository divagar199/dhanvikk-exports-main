import dotenv from 'dotenv';
dotenv.config();
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

let firebaseAdminApp = null;
let firestoreDb = null;
let firebaseAuth = null;

try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const serviceAccountPath = path.resolve(__dirname, '../../config/firebase-service-account.json');

  let serviceAccount = null;

  const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
  if (rawEnv) {
    try {
      serviceAccount = JSON.parse(rawEnv.trim());
    } catch {
      try {
        const decoded = Buffer.from(rawEnv.trim(), 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      } catch (parseErr) {
        console.warn('⚠️ Could not parse FIREBASE_SERVICE_ACCOUNT from environment:', parseErr.message);
      }
    }
  }

  if (!serviceAccount && fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  }

  if (serviceAccount) {
    firebaseAdminApp = getApps().length === 0
      ? initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || 'auth-checker-1-main',
        })
      : getApps()[0];

    firestoreDb = getFirestore(firebaseAdminApp);
    firebaseAuth = getAuth(firebaseAdminApp);
    console.log(`✅ Firebase Admin SDK initialized successfully for project: ${serviceAccount.project_id || 'auth-checker-1-main'}`);
  } else {
    console.warn('⚠️ Firebase service account not found in env or at:', serviceAccountPath);
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
}

export { firebaseAdminApp, firestoreDb, firebaseAuth };
export default firebaseAdminApp;
