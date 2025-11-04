import "./config/env.js"; // Cargar variables de entorno PRIMERO
import express from "express";
import cors from "cors";

console.log("📍 Current working directory:", process.cwd());
console.log(
  "🔑 STRIPE_SECRET_KEY from env:",
  process.env.STRIPE_SECRET_KEY
    ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + "..."
    : "NOT FOUND"
);
console.log(
  "🗄️  MONGODB_URI from env:",
  process.env.MONGODB_URI ? "FOUND" : "NOT FOUND"
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

console.log("✅ Rutas registradas:");
console.log("   - /api/auth");
console.log("   - /api/trainers");
console.log("   - /api/classes");
console.log("   - /api/reservations");
console.log("   - /api/me");
console.log("   - /api/payments (protegida)");
console.log("   - /api/notifications (protegida)");
console.log("   - /api/stats (protegida)");
console.log("   - /api/plans (protegida)");
console.log("   - /api/trainer (protegida)");

app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
