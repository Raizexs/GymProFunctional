import cron from "node-cron";
import { sendClassReminders } from "../services/notification.service.js";
import Reservation from "../models/Reservation.js";
import Class from "../models/Class.js";

/**
 * Archivar reservas de clases pasadas
 * Marca como COMPLETED las reservas confirmadas cuya fecha/hora ya pasó
 */
async function archiveOldReservations() {
  try {
    const now = new Date();
    console.log(`\n🗄️  Archivando reservas antiguas...`);

    // Obtener todas las clases para conocer sus horarios
    const classes = await Class.find();
    const classesMap = {};
    classes.forEach((cls) => {
      classesMap[cls._id.toString()] = cls;
    });

    // Encontrar reservas confirmadas que ya pasaron
    const reservations = await Reservation.find({
      status: { $in: ["CONFIRMED", "PENDING_PAYMENT"] },
      date: { $lt: now },
    }).populate("classId");

    let archivedCount = 0;
    let cancelledCount = 0;

    for (const reservation of reservations) {
      if (!reservation.classId) continue;

      // Obtener la hora de la clase
      const classTime = reservation.classId.time; // Ejemplo: "08:00"
      const [hours, minutes] = classTime.split(":").map(Number);

      // Crear fecha/hora completa de la clase
      const classDateTime = new Date(reservation.date);
      classDateTime.setHours(hours, minutes, 0, 0);

      // Si la clase ya pasó
      if (classDateTime < now) {
        if (reservation.status === "CONFIRMED") {
          // Si no asistió, marcarlo como no show (completado sin asistencia)
          reservation.status = "COMPLETED";
          if (reservation.attended === undefined) {
            reservation.attended = false;
          }
          await reservation.save();
          archivedCount++;
        } else if (reservation.status === "PENDING_PAYMENT") {
          // Si no pagó a tiempo, cancelar
          reservation.status = "CANCELLED";
          reservation.cancellationReason = "Pago no completado a tiempo";
          reservation.cancelledAt = now;
          await reservation.save();
          cancelledCount++;
        }
      }
    }

    console.log(
      `✅ Archivadas ${archivedCount} reservas completadas y ${cancelledCount} canceladas automáticamente`
    );
  } catch (error) {
    console.error("❌ Error archivando reservas:", error.message);
  }
}

/**
 * Configurar todos los cron jobs del sistema
 */
export function setupCronJobs() {
  console.log("⏰ Configurando cron jobs...");

  // Ejecutar cada hora para enviar recordatorios de clases
  // Corre en el minuto 0 de cada hora: 00:00, 01:00, 02:00, etc.
  cron.schedule(
    "0 * * * *",
    async () => {
      const now = new Date();
      console.log(
        `\n⏰ [${now.toISOString()}] Ejecutando cron: Envío de recordatorios de clases`
      );

      try {
        await sendClassReminders();
        console.log("✅ Recordatorios de clases enviados correctamente");
      } catch (error) {
        console.error(
          "❌ Error enviando recordatorios de clases:",
          error.message
        );
      }
    },
    {
      scheduled: true,
      timezone: "America/New_York", // Ajusta según tu zona horaria
    }
  );

  // Ejecutar cada hora para archivar reservas antiguas
  // Corre 5 minutos después de cada hora: 00:05, 01:05, 02:05, etc.
  cron.schedule(
    "5 * * * *",
    async () => {
      const now = new Date();
      console.log(
        `\n⏰ [${now.toISOString()}] Ejecutando cron: Archivo de reservas antiguas`
      );

      try {
        await archiveOldReservations();
      } catch (error) {
        console.error("❌ Error archivando reservas antiguas:", error.message);
      }
    },
    {
      scheduled: true,
      timezone: "America/New_York", // Ajusta según tu zona horaria
    }
  );

  console.log("✅ Cron jobs configurados:");
  console.log("   📧 Recordatorios de clases: Cada hora (0 * * * *)");
  console.log("   🗄️  Archivo de reservas: Cada hora (5 * * * *)");
  console.log("");
}

/**
 * Ejecutar todos los cron jobs manualmente (para testing)
 */
export async function runCronJobsManually() {
  console.log("🔧 Ejecutando cron jobs manualmente...\n");

  try {
    console.log("📧 Enviando recordatorios de clases...");
    await sendClassReminders();
    console.log("✅ Recordatorios enviados\n");

    console.log("🗄️  Archivando reservas antiguas...");
    await archiveOldReservations();
    console.log("✅ Archivo completado\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}
