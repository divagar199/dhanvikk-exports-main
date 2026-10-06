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

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    firebaseAdminApp = getApps().length === 0
      ? initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || 'auth-checker-diva',
        })
      : getApps()[0];

    firestoreDb = getFirestore(firebaseAdminApp);
    firebaseAuth = getAuth(firebaseAdminApp);
    console.log('✅ Firebase Admin SDK initialized successfully for project: auth-checker-diva');
  } else {
    console.warn('⚠️ Firebase service account file not found at:', serviceAccountPath);
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
}

export { firebaseAdminApp, firestoreDb, firebaseAuth };
export default firebaseAdminApp;
