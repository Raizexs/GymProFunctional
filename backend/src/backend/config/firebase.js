import admin from "firebase-admin";
import { env } from "./env.js";
import logger from "./logger.js";

let firebaseInitialized = false;

/**
 * Inicializa Firebase Admin SDK
 * Requiere FIREBASE_SERVICE_ACCOUNT en .env (JSON stringificado)
 */
export const initializeFirebase = () => {
  if (firebaseInitialized) {
    return admin;
  }

  try {
    const serviceAccount = env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (!serviceAccount) {
      logger.warn(
        "Firebase service account not configured. Push notifications will be disabled."
      );
      return null;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    logger.info("✅ Firebase Admin SDK initialized successfully");
    return admin;
  } catch (error) {
    logger.error("❌ Failed to initialize Firebase Admin SDK:", error);
    return null;
  }
};

/**
 * Obtiene la instancia de Firebase Admin
 */
export const getFirebaseAdmin = () => {
  if (!firebaseInitialized) {
    return initializeFirebase();
  }
  return admin;
};

export default { initializeFirebase, getFirebaseAdmin };
