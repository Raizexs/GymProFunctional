import "../config/env.js"; // Cargar variables de entorno PRIMERO
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import logger from "../config/logger.js";

// Configuración de reintentos
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 segundo base

// Función de delay con exponential backoff
const delay = (ms, attempt) => {
  const backoffMs = ms * Math.pow(2, attempt);
  return new Promise((resolve) => setTimeout(resolve, backoffMs));
};

// Verificar si SMTP está configurado
const isSmtpConfigured =
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.SMTP_USER !== "your-email@gmail.com";

// Configurar el transporter de email
let emailTransporter = null;

if (isSmtpConfigured) {
  try {
    emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true, // Usar pool de conexiones
      maxConnections: 5,
      maxMessages: 100,
    });

    // Verificar la configuración al iniciar
    emailTransporter.verify((error, success) => {
      if (error) {
        logger.error("Error en configuración SMTP:", error);
        emailTransporter = null;
      } else {
        logger.info("✅ Servidor SMTP configurado correctamente");
      }
    });
  } catch (error) {
    logger.error("Error creando transporter SMTP:", error);
    emailTransporter = null;
  }
} else {
  logger.warn("SMTP no configurado. Los emails no se enviarán.");
  logger.info("Configura las variables SMTP_* en el archivo .env");
}

/**
 * Crear una notificación
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  sentVia = ["IN_APP"],
  relatedId,
  relatedModel,
  metadata,
}) {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      sentVia,
      relatedId,
      relatedModel,
      metadata,
    });

    // Enviar por email si está configurado
    if (sentVia.includes("EMAIL")) {
      await sendEmailNotification({
        userId,
        title,
        message,
        metadata,
      });
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Enviar notificación por email con reintentos
 */
async function sendEmailNotification({
  userId,
  title,
  message,
  metadata = {},
}) {
  // Si SMTP no está configurado, solo loguear
  if (!emailTransporter) {
    logger.info(`📧 [SIMULADO] Email a usuario ${userId}: ${title}`);
    return;
  }

  try {
    // Obtener el email del usuario desde la BD
    const user = await User.findById(userId);

    if (!user || !user.email) {
      logger.warn(`Usuario ${userId} no tiene email configurado`);
      return;
    }

    // Intentar enviar con reintentos
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Crear el HTML del email con plantilla mejorada
        const htmlContent = createEmailTemplate(title, message, metadata);

        // Enviar el email
        const info = await emailTransporter.sendMail({
          from: process.env.SMTP_FROM || "Gimnasio Pro <noreply@gympro.com>",
          to: user.email,
          subject: title,
          html: htmlContent,
        });

        logger.info(`✅ Email enviado a ${user.email} (ID: ${info.messageId})`);
        return; // Éxito, salir
      } catch (error) {
        lastError = error;
        logger.warn(
          `Intento ${attempt + 1}/${MAX_RETRIES} falló para ${user.email}: ${
            error.message
          }`
        );

        // Si no es el último intento, esperar antes de reintentar
        if (attempt < MAX_RETRIES - 1) {
          await delay(RETRY_DELAY_MS, attempt);
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    logger.error(
      `❌ Email falló después de ${MAX_RETRIES} intentos a ${user.email}:`,
      lastError
    );
  } catch (error) {
    logger.error("Error enviando email:", error);
    // No lanzar error para no bloquear la creación de la notificación
  }
}

/**
 * Crear plantilla HTML para email
 */
function createEmailTemplate(title, message, metadata = {}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Container principal -->
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header con gradiente -->
              <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    🏋️ Gimnasio Pro
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">
                    Funcional
                  </p>
                </td>
              </tr>
              
              <!-- Contenido -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                    ${title}
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    ${message}
                  </p>
                  
                  ${
                    metadata.actionUrl
                      ? `
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${metadata.actionUrl}" 
                             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            ${metadata.actionText || "Ver Detalles"}
                          </a>
                        </td>
                      </tr>
                    </table>
                  `
                      : ""
                  }
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                    Este es un mensaje automático de Gimnasio Pro
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Por favor no responder a este correo
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Obtener notificaciones de un usuario
 */
export async function getUserNotifications({
  userId,
  unreadOnly = false,
  limit = 20,
  offset = 0,
}) {
  const query = { userId };
  if (unreadOnly) {
    query.read = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    userId,
    read: false,
  });

  return {
    notifications,
    total,
    unreadCount,
    hasMore: offset + limit < total,
  };
}

/**
 * Marcar notificación como leída
 */
export async function markAsRead({ notificationId, userId }) {
  const notification = await Notification.findOne({
    _id: notificationId,
    userId,
  });

  if (!notification) {
    throw new Error("Notificación no encontrada");
  }

  notification.read = true;
  await notification.save();

  return notification;
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllAsRead({ userId }) {
  await Notification.updateMany({ userId, read: false }, { read: true });

  return { success: true };
}

/**
 * Eliminar una notificación
 */
export async function deleteNotification({ notificationId, userId }) {
  const result = await Notification.deleteOne({
    _id: notificationId,
    userId,
  });

  if (result.deletedCount === 0) {
    throw new Error("Notificación no encontrada");
  }

  return { success: true };
}

/**
 * Enviar recordatorios de clase (se ejecuta con un cron job)
 */
export async function sendClassReminders() {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Importar Reservation aquí para evitar dependencias circulares
    const Reservation = (await import("../models/Reservation.js")).default;
    const Class = (await import("../models/Class.js")).default;

    // Encontrar reservas que ocurren en 24 horas
    const reservations24h = await Reservation.find({
      date: {
        $gte: in24Hours,
        $lt: new Date(in24Hours.getTime() + 60 * 60 * 1000),
      },
      status: "CONFIRMED",
    }).populate("classId userId");

    for (const reservation of reservations24h) {
      await createNotification({
        userId: reservation.userId._id,
        type: "CLASS_REMINDER_24H",
        title: "Recordatorio de Clase",
        message: `Tu clase de ${reservation.classId.title} es mañana a las ${reservation.classId.time}`,
        relatedId: reservation._id,
        relatedModel: "Reservation",
        sentVia: ["EMAIL", "IN_APP"],
      });
    }

    // Encontrar reservas que ocurren en 2 horas
    const reservations2h = await Reservation.find({
      date: {
        $gte: in2Hours,
        $lt: new Date(in2Hours.getTime() + 30 * 60 * 1000),
      },
      status: "CONFIRMED",
    }).populate("classId userId");

    for (const reservation of reservations2h) {
      await createNotification({
        userId: reservation.userId._id,
        type: "CLASS_REMINDER_2H",
        title: "¡Tu clase es pronto!",
        message: `Tu clase de ${reservation.classId.title} comienza en 2 horas`,
        relatedId: reservation._id,
        relatedModel: "Reservation",
        sentVia: ["EMAIL", "IN_APP", "PUSH"],
      });
    }

    console.log(
      `✅ Sent ${reservations24h.length + reservations2h.length} reminders`
    );
  } catch (error) {
    console.error("Error sending class reminders:", error);
  }
}
