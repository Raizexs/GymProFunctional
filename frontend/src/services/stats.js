import http from "./http";

export const StatsService = {
  /**
   * Obtener estadísticas del dashboard según rol
   */
  async getDashboardStats() {
    const { data } = await http.get("/stats/dashboard");
    return data;
  },

  /**
   * Obtener reporte de ingresos (solo admin)
   */
  async getRevenueReport(startDate, endDate, groupBy = "day") {
    const { data } = await http.get("/stats/revenue", {
      params: { startDate, endDate, groupBy },
    });
    return data;
  },

  /**
   * Obtener KPIs de ocupación y no-show (admin/trainer)
   */
  async getOccupancyAndNoShowKPIs(startDate, endDate) {
    const { data } = await http.get("/stats/occupancy-noshow", {
      params: { startDate, endDate },
    });
    return data;
  },
};

export default StatsService;
