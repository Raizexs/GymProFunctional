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
};

export default StatsService;
