import express from "express";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from "../services/notification.service.js";

const router = express.Router();

/**
 * GET /api/notifications
 * Obtener notificaciones del usuario
 */
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly = false, limit = 20, offset = 0 } = req.query;

    const result = await getUserNotifications({
      userId,
      unreadOnly: unreadOnly === "true",
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(result);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Marcar notificación como leída
 */
router.put("/:id/read", async (req, res) => {
  try {
    const { id: notificationId } = req.params;
    const userId = req.user.id;

    const notification = await markAsRead({ notificationId, userId });

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/notifications/read-all
 * Marcar todas las notificaciones como leídas
 */
router.put("/read-all", async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await markAllAsRead({ userId });

    res.json(result);
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/notifications/:id
 * Eliminar una notificación
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id: notificationId } = req.params;
    const userId = req.user.id;

    const result = await deleteNotification({ notificationId, userId });

    res.json(result);
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/test
 * Enviar notificación de prueba (solo para testing)
 */
router.post("/test", async (req, res) => {
  try {
    const userId = req.user.id;

    // Crear notificación de prueba con email
    const notification = await createNotification({
      userId,
      type: "GENERAL",
      title: "🧪 Email de Prueba - Gimnasio Pro",
      message:
        "Este es un email de prueba para verificar que la configuración SMTP funciona correctamente. Si recibes este mensaje, ¡todo está funcionando! 🎉",
      sentVia: ["EMAIL", "IN_APP"],
      metadata: {
        actionUrl: "http://localhost:5173",
        actionText: "Ir al Dashboard",
      },
    });

    res.json({
      success: true,
      message: "Notificación de prueba creada. Revisa tu email.",
      notification,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/send-reminders
 * Enviar recordatorios de clases manualmente (solo para testing/admin)
 */
router.post("/send-reminders", async (req, res) => {
  try {
    // Importar la función de recordatorios
    const { sendClassReminders } = await import(
      "../services/notification.service.js"
    );

    await sendClassReminders();

    res.json({
      success: true,
      message: "Recordatorios de clases enviados correctamente",
    });
  } catch (error) {
    console.error("Error sending class reminders:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
