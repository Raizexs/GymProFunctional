import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Configuración de Firebase
// IMPORTANTE: Estos valores deben venir de tu proyecto Firebase
// Ve a Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Validar que la configuración existe
const isConfigured = Object.values(firebaseConfig).every((val) => val !== "");

let app = null;
let messaging = null;

if (isConfigured) {
  try {
    // Inicializar Firebase
    app = initializeApp(firebaseConfig);

    // Inicializar Firebase Cloud Messaging
    messaging = getMessaging(app);

    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing Firebase:", error);
  }
} else {
  console.warn(
    "⚠️ Firebase not configured. Push notifications will be disabled."
  );
  console.info("Configure VITE_FIREBASE_* variables in .env file");
}

/**
 * Solicitar permiso para notificaciones y obtener el token FCM
 */
export async function requestNotificationPermission() {
  if (!messaging) {
    console.warn("Firebase messaging not initialized");
    return null;
  }

  try {
    // Verificar si el navegador soporta notificaciones
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return null;
    }

    // Solicitar permiso
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // Obtener el token de FCM
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
      console.warn("VITE_FIREBASE_VAPID_KEY not configured");
      return null;
    }

    const token = await getToken(messaging, { vapidKey });

    console.log("✅ FCM Token obtained:", token);
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

/**
 * Escuchar notificaciones en primer plano
 */
export function onForegroundMessage(callback) {
  if (!messaging) {
    console.warn("Firebase messaging not initialized");
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log("📬 Message received in foreground:", payload);
    callback(payload);
  });
}

export { app, messaging };
