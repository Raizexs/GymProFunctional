import cron from "node-cron";
import { sendClassReminders } from "../services/notification.service.js";

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

  console.log("✅ Cron jobs configurados:");
  console.log("   📧 Recordatorios de clases: Cada hora (0 * * * *)");
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
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}
