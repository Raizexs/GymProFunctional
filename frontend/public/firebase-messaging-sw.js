// Service Worker para Firebase Cloud Messaging
// Este archivo debe estar en la raíz del dominio (public/)

// Importar Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// Configuración de Firebase (debe coincidir con src/config/firebase.js)
// IMPORTANTE: En producción, considera usar variables de entorno del build
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener instancia de messaging
const messaging = firebase.messaging();

// Manejar notificaciones en background
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification?.title || "Gimnasio Pro";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/gym-icon.png",
    badge: "/gym-badge.png",
    data: payload.data,
    tag: payload.data?.type || "default",
    requireInteraction: false,
    actions: [
      {
        action: "open",
        title: "Ver Detalles",
      },
      {
        action: "close",
        title: "Cerrar",
      },
    ],
  };

  // Mostrar la notificación
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Manejar clicks en las notificaciones
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received.");

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Obtener la URL de navegación del payload
  const clickAction = event.notification.data?.clickAction || "/";

  // Abrir o enfocar la ventana de la app
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              data: event.notification.data,
            });
            return client.focus();
          }
        }

        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(clickAction);
        }
      })
  );
});
