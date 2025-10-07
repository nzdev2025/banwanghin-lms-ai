// Firebase initialization and helper utilities
//
// This module initializes the Firebase app and exports the Firestore
// database, authentication object and convenience methods for common
// operations.  It performs a sanity check on required environment
// variables to help developers catch misconfiguration early and
// gracefully handles initialization errors.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// Build the Firebase config from environment variables.  We
// intentionally avoid hardcoding property names to minimise typos and
// log a warning when variables are missing.  Firebase itself will
// throw if the configuration is incomplete, but a warning helps
// identify the root cause quickly.
const firebaseConfig = {};
const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];
requiredKeys.forEach((key) => {
  const val = import.meta.env[key];
  if (!val) {
    // eslint-disable-next-line no-console
    console.warn(`Firebase environment variable ${key} is not set`);
  }
  // Derive the config property name (e.g. API_KEY -> api_key).  We
  // lowercase to match Firebase JS SDK expectations.  See
  // https://firebase.google.com/docs/web/setup#config-object
  // Convert e.g. API_KEY -> apiKey by lowercasing the first word
  // and capitalising subsequent words.  This matches the property
  // names expected by the Firebase SDK.  Example: PROJECT_ID
  // becomes projectId.
  const parts = key.replace('VITE_FIREBASE_', '').toLowerCase().split('_');
  const camelCaseKey = parts
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');
  firebaseConfig[camelCaseKey] = val;
});

let app;
let db;
let auth;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('Firebase initialization error:', e);
}

// Export a default appId in case one is injected at runtime.  When
// compiled for production this constant can be replaced with a global
// variable by your bundler to target a different Firestore path.
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'banwanghin-lms-dev';

/**
 * Record an activity log entry in Firestore.  Each entry stores a
 * message, type, optional details and a server-generated timestamp.
 * Errors are caught so that logging never interrupts the main flow of
 * the application.
 *
 * @param {string} type A category for the log entry (e.g. 'info' or 'error').
 * @param {string} message A human-readable description of the event.
 * @param {object} [details={}] Additional structured data about the event.
 */
export const logActivity = async (type, message, details = {}) => {
  if (!db) return;
  try {
    const logPath = `artifacts/${appId}/public/data/activity_log`;
    await addDoc(collection(db, logPath), {
      type,
      message,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error logging activity:', error);
  }
};

// Authentication helpers.  These thin wrappers forward to Firebase
// methods and could be extended to handle custom error reporting or
// analytics in a single place.
export const handleSignUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};
export const handleLogin = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};
export const handleLogout = () => {
  return signOut(auth);
};

// Export Firestore and auth along with onAuthStateChanged for consumers
export { db, auth, onAuthStateChanged };
