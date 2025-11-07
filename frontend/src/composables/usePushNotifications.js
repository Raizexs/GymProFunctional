import { ref, onMounted, onUnmounted } from "vue";
import {
  requestNotificationPermission,
  onForegroundMessage,
} from "../config/firebase";
import http from "../services/http";
import { useNotificationsStore } from "../stores/notifications";

export function usePushNotifications() {
  const isSupported = ref(false);
  const isEnabled = ref(false);
  const token = ref(null);
  const error = ref(null);
  const notificationsStore = useNotificationsStore();

  let unsubscribe = null;

  /**
   * Verificar si las notificaciones push están soportadas
   */
  const checkSupport = () => {
    isSupported.value =
      "Notification" in window && "serviceWorker" in navigator;
    return isSupported.value;
  };

  /**
   * Solicitar permisos y registrar el token
   */
  const requestPermission = async () => {
    try {
      if (!checkSupport()) {
        throw new Error("Push notifications are not supported in this browser");
      }

      // Registrar el service worker
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("✅ Service Worker registered:", registration);

      // Solicitar permiso y obtener token
      const fcmToken = await requestNotificationPermission();

      if (!fcmToken) {
        throw new Error("Failed to get FCM token");
      }

      token.value = fcmToken;

      // Registrar el token en el backend
      await http.post("/api/notifications/register-token", {
        token: fcmToken,
        platform: "web",
      });

      isEnabled.value = true;
      console.log("✅ Push notifications enabled");

      return fcmToken;
    } catch (err) {
      console.error("Error enabling push notifications:", err);
      error.value = err.message;
      isEnabled.value = false;
      throw err;
    }
  };

  /**
   * Desactivar notificaciones push
   */
  const disable = async () => {
    try {
      if (!token.value) return;

      // Eliminar el token del backend
      await http.delete("/api/notifications/unregister-token", {
        data: { token: token.value },
      });

      token.value = null;
      isEnabled.value = false;
      console.log("✅ Push notifications disabled");
    } catch (err) {
      console.error("Error disabling push notifications:", err);
      error.value = err.message;
      throw err;
    }
  };

  /**
   * Escuchar notificaciones en primer plano
   */
  const setupForegroundListener = () => {
    unsubscribe = onForegroundMessage((payload) => {
      console.log("📬 Foreground notification:", payload);

      // Actualizar el store de notificaciones
      notificationsStore.fetchNotifications();

      // Mostrar notificación nativa del navegador
      if (Notification.permission === "granted") {
        new Notification(payload.notification?.title || "Gimnasio Pro", {
          body: payload.notification?.body || "",
          icon: "/gym-icon.png",
          data: payload.data,
        });
      }
    });
  };

  /**
   * Verificar si ya tiene permisos concedidos
   */
  const checkExistingPermission = async () => {
    if (!checkSupport()) return;

    if (Notification.permission === "granted") {
      try {
        // Intentar obtener el token sin solicitar permiso
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          token.value = fcmToken;
          isEnabled.value = true;

          // Registrar/actualizar el token en el backend
          await http.post("/api/notifications/register-token", {
            token: fcmToken,
            platform: "web",
          });
        }
      } catch (err) {
        console.error("Error checking existing permission:", err);
      }
    }
  };

  onMounted(() => {
    checkSupport();
    setupForegroundListener();
    checkExistingPermission();
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  return {
    isSupported,
    isEnabled,
    token,
    error,
    requestPermission,
    disable,
  };
}
