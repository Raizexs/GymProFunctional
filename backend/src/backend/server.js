import "./config/env.js"; // Cargar variables de entorno PRIMERO
import express from "express";
import cors from "cors";
import logger from "./config/logger.js";

logger.info("📍 Current working directory: " + process.cwd());
logger.info(
  "🔑 STRIPE_SECRET_KEY: " +
    (process.env.STRIPE_SECRET_KEY
      ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + "..."
      : "NOT FOUND")
);
logger.info(
  "🗄️  MONGODB_URI: " + (process.env.MONGODB_URI ? "FOUND" : "NOT FOUND")
);

import connectDB from "./config/database.js";
import { setupCronJobs } from "./config/cron.js";
import authRouter from "./routes/auth.routes.js";
import trainersRouter from "./routes/trainers.routes.js";
import classesRouter from "./routes/classes.routes.js";
import reservationsRouter from "./routes/reservations.routes.js";
import meRouter from "./routes/me.routes.js";
import paymentsRouter from "./routes/payments.routes.js";
import notificationsRouter from "./routes/notifications.routes.js";
import statsRouter from "./routes/stats.routes.js";
import plansRouter from "./routes/plans.routes.js";
import trainerClassesRouter from "./routes/trainer-classes.routes.js";
import { requireAuth } from "./middlewares/auth.middleware.js";

// Conectar a MongoDB
connectDB();

// Configurar cron jobs para recordatorios automáticos
setupCronJobs();

const app = express();
const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Permitir múltiples orígenes para desarrollo
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174", ORIGIN],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api", authRouter);
app.use("/api/trainers", trainersRouter);
app.use("/api/classes", classesRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/me", meRouter);

// Nuevas rutas protegidas
app.use("/api/payments", requireAuth, paymentsRouter);
app.use("/api/notifications", requireAuth, notificationsRouter);
app.use("/api/stats", requireAuth, statsRouter);
app.use("/api/plans", requireAuth, plansRouter);
app.use("/api/trainer", requireAuth, trainerClassesRouter);

logger.info("✅ Rutas registradas:");
logger.info("   - /api/auth");
logger.info("   - /api/trainers");
logger.info("   - /api/classes");
logger.info("   - /api/reservations");
logger.info("   - /api/me");
logger.info("   - /api/payments (protegida)");
logger.info("   - /api/notifications (protegida)");
logger.info("   - /api/stats (protegida)");
logger.info("   - /api/plans (protegida)");
logger.info("   - /api/trainer (protegida)");

// Solo iniciar servidor si no estamos en modo test
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    logger.info(`🚀 API running at http://localhost:${PORT}`)
  );
}

// Exportar app para tests
export default app;
