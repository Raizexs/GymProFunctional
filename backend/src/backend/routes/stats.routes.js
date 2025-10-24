import express from "express";
import {
  getDashboardStats,
  getRevenueReport,
} from "../services/stats.service.js";

const router = express.Router();

/**
 * GET /api/stats/dashboard
 * Obtener estadísticas del dashboard según el rol del usuario
 */
router.get("/dashboard", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    const stats = await getDashboardStats({
      startDate,
      endDate,
      userId,
      role,
    });

    res.json(stats);
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats/revenue
 * Obtener reporte de ingresos (solo admin)
 */
router.get("/revenue", async (req, res) => {
  try {
    // Verificar que sea admin
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const { startDate, endDate, groupBy = "day" } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Se requieren startDate y endDate" });
    }

    const report = await getRevenueReport({
      startDate,
      endDate,
      groupBy,
    });

    res.json(report);
  } catch (error) {
    console.error("Error getting revenue report:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
