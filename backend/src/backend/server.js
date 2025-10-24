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
import { requireAuth } from "./middlewares/auth.middleware.js";

// Conectar a MongoDB
connectDB();

// Configurar cron jobs para recordatorios automáticos
setupCronJobs();

const app = express();
const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: ORIGIN, credentials: true }));
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

app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
